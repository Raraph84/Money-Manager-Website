"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info, LinkedTr } from "../../utils";
import { getBusinesses } from "../../api";
import Link from "next/link";

class Businesses extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, businesses: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getBusinesses().then((businesses) => {
            this.setState({ requesting: false, businesses });
        }).catch((error) => {
            if (error === "Invalid token") {
                localStorage.removeItem("token");
                this.props.router.push("/login?" + new URLSearchParams([["redirectUrl", this.props.pathname + this.props.searchParams.toString()]]).toString());
            } else
                this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> });
        });
    }

    render() {
        return <div>

            <div className="page-title">Entreprises</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <Link href="/businesses/create" className="create-button">Créer une entreprise</Link>

            {this.state.businesses && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.businesses.map((business) => <LinkedTr key={business.id} href={"/businesses/" + business.id}>
                            <td>{business.name}</td>
                        </LinkedTr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <Businesses {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
