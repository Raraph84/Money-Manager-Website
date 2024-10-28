"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getPerson } from "../../../api";

class Person extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, person: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getPerson(this.props.params.personId).then((person) => {
            this.setState({ requesting: false, person });
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

            <div className="page-title">Personne</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.person && <>
                <div>Nom : {this.state.person.name}</div>
                <div>Solde : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.person.balance)}</div>
            </>}

        </div>;
    }
}

export default (props) => <Person {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
