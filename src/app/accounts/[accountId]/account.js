"use client";

import { Component, Fragment } from "react";
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
            getFlows(["fromAccount", "toAccount", "links", "links.inflow", "links.inflow.person", "links.inflow.fromBusiness", "links.outflow", "links.outflow.person", "links.outflow.toBusiness"], [this.props.params.accountId])
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
                        {flow.links.filter((flowLink) => flowLink.inflow).map(({ inflow }) => <Fragment key={inflow.id}>
                            <div>{inflow.fromName ?? inflow.fromBusiness.name} {"->"} {inflow.person.name}</div>
                            {inflow.description && <div>- {inflow.description}</div>}
                            {inflow.startDate && inflow.endDate && <div>- {moment(inflow.startDate).format("DD/MM/YYYY")} {"->"} {moment(inflow.endDate).format("DD/MM/YYYY")}</div>}
                        </Fragment>)}
                        {flow.fromAccount && flow.fromAccount.id !== this.state.account.id && <div>{flow.fromAccount.name}</div>}
                        {flow.links.filter((flowLink) => flowLink.outflow).map(({ outflow }) => <Fragment key={outflow.id}>
                            <div>{outflow.person.name} {"->"} {outflow.toName ?? outflow.toBusiness.name}</div>
                            {outflow.description && <div>- {outflow.description}</div>}
                            {outflow.startDate && outflow.endDate && <div>- {moment(outflow.startDate).format("DD/MM/YYYY")} {"->"} {moment(outflow.endDate).format("DD/MM/YYYY")}</div>}
                        </Fragment>)}
                        {flow.toAccount && flow.toAccount.id !== this.state.account.id && <div>{flow.toAccount.name}</div>}
                    </span>
                    <span>
                        <div>{flow.fromAccount?.id === this.state.account.id ? "-" : "+"}{numberFormat.format(flow.amount)}</div>
                        <div>{moment(flow.date).format("DD/MM/YYYY")}</div>
                    </span>
                </Link>)}
            </div>}

        </div>;
    }
}

export default (props) => <Account {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
