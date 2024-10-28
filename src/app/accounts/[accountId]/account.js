"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getAccount } from "../../../api";

class Account extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, account: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getAccount(this.props.params.accountId).then((account) => {
            this.setState({ requesting: false, account });
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

            <div className="page-title">Compte</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.account && <>
                <div>Nom : {this.state.account.name}</div>
                <div>Solde : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.account.balance)}</div>
            </>}

        </div>;
    }
}

export default (props) => <Account {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
