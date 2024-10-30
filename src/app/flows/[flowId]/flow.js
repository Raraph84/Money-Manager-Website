"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getFlow } from "../../../api";
import moment from "moment";

class Flow extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, flow: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getFlow(this.props.params.flowId, ["fromAccount", "toAccount"]).then((flow) => {
            this.setState({ requesting: false, flow });
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

            <div className="page-title">Transaction</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.flow && <>
                <div>Source : {this.state.flow.fromAccount?.name ?? "Entrées"}</div>
                <div>Destination : {this.state.flow.toAccount?.name ?? "Sorties"}</div>
                <div>Montant : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.flow.amount)}</div>
                <div>Date : {moment(this.state.flow.date).format("DD/MM/YYYY")}</div>
            </>}

        </div>;
    }
}

export default (props) => <Flow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
