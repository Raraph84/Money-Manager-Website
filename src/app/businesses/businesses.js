"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info } from "../utils";
import { getBusinesses } from "../../api";

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

            {this.state.businesses && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.businesses.map((account) => <tr key={account.id}>
                            <td>{account.name}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <Businesses {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
