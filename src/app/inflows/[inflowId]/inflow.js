"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getInflow } from "../../../api";
import moment from "moment";

class Inflow extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, inflow: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getInflow(this.props.params.inflowId, ["person", "fromBusiness"]).then((inflow) => {
            this.setState({ requesting: false, inflow });
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

            <div className="page-title">Entrée</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.inflow && <>
                <div>Personne : {this.state.inflow.person.name}</div>
                <div>Source : {this.state.inflow.fromName ?? this.state.inflow.fromBusiness.name}</div>
                <div>Montant : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.inflow.amount)}</div>
                <div>Description : {this.state.inflow.description ?? "N/A"}</div>
                <div>Dates : {this.state.inflow.startDate ? `${moment(this.state.inflow.startDate).format("DD/MM/YYYY")} -> ${moment(this.state.inflow.endDate).format("DD/MM/YYYY")}` : "N/A"}</div>
                <div>Date : {moment(this.state.inflow.date).format("DD/MM/YYYY")}</div>
            </>}

        </div>;
    }
}

export default (props) => <Inflow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
