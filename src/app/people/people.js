"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info, LinkedTr } from "../utils";
import { getPeople } from "../../api";

class People extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, people: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getPeople().then((people) => {
            this.setState({ requesting: false, people });
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

            <div className="page-title">Personnes</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.people && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Solde</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.people.map((person) => <LinkedTr key={person.id} href={"/people/" + person.id}>
                            <td>{person.name}</td>
                            <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(person.balance)}</td>
                        </LinkedTr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <People {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
