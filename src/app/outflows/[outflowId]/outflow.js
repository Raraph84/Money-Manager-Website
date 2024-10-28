"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getOutflow } from "../../../api";
import moment from "moment";

class Outflow extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, outflow: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getOutflow(this.props.params.outflowId, ["person", "toBusiness"]).then((outflow) => {
            this.setState({ requesting: false, outflow });
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

            <div className="page-title">Sortie</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.outflow && <>
                <div>Personne : {this.state.outflow.person.name}</div>
                <div>Destination : {this.state.outflow.toName ?? this.state.outflow.toBusiness.name}</div>
                <div>Montant : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.outflow.amount)}</div>
                <div>Description : {this.state.outflow.description ?? "N/A"}</div>
                <div>Dates : {this.state.outflow.startDate ? `${moment(this.state.outflow.startDate).format("DD/MM/YYYY")} -> ${moment(this.state.outflow.endDate).format("DD/MM/YYYY")}` : "N/A"}</div>
                <div>Date : {moment(this.state.outflow.date).format("DD/MM/YYYY")}</div>
            </>}

        </div>;
    }
}

export default (props) => <Outflow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
