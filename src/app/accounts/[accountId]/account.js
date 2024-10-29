"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getAccount, getFlows } from "../../../api";
import Link from "next/link";
import moment from "moment";

class Account extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, account: null, flows: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        Promise.all([
            getAccount(this.props.params.accountId).then((account) => {
                this.setState({ account });
            }).catch((error) => {
                if (error === "Invalid token") {
                    localStorage.removeItem("token");
                    this.props.router.push("/login?" + new URLSearchParams([["redirectUrl", this.props.pathname + this.props.searchParams.toString()]]).toString());
                } else
                    this.setState({ info: <Info>Un problème est survenu !</Info> });
            }),
            getFlows(["inflow", "inflow.fromBusiness", "fromAccount", "outflow", "outflow.toBusiness", "toAccount"], [this.props.params.accountId])
                .then((flows) => this.setState({ flows }))
                .catch(() => this.setState({ info: <Info>Un problème est survenu !</Info> }))
        ]).then(() => this.setState({ requesting: false }));
    }

    render() {

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        return <div>

            <div className="page-title">Compte</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.account && <>
                <div>Nom : {this.state.account.name}</div>
                <div>Solde : {numberFormat.format(this.state.account.balance)}</div>
            </>}

            {this.state.flows && <div className="flows">
                {this.state.flows.map((flow) => <Link key={flow.id} href={"/flows/" + flow.id}>
                    <span>
                        {flow.fromAccount?.id === this.state.account.id
                            ? <div>{flow.toAccount?.name ?? flow.outflow.toName ?? flow.outflow.toBusiness.name}</div>
                            : <div>{flow.fromAccount?.name ?? flow.inflow.fromName ?? flow.inflow.fromBusiness.name}</div>}
                        <div>{moment(flow.date).format("DD/MM/YYYY")}</div>
                    </span>
                    <span>{flow.fromAccount?.id === this.state.account.id ? "-" : "+"}{numberFormat.format(flow.amount)}</span>
                </Link>)}
            </div>}

        </div>;
    }
}

export default (props) => <Account {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
