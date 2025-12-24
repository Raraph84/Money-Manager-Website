"use client";

import { Component, createRef } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info, CreateInflowForm } from "../../../utils";
import { getInflow, deleteInflow } from "../../../api";
import Link from "next/link";
import moment from "moment";

class Inflow extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null, inflow: null, updating: false };
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

        const handleDelete = () => {

            if (!confirm("Voulez-vous vraiment supprimer cette entrée ?")) return;

            this.setState({ requesting: true, info: null });
            deleteInflow(this.state.inflow.id)
                .then(() => this.props.router.push("/inflows"))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const handleUpdate = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then((inflow) => this.setState({ requesting: false, inflow, updating: false }))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        return <div>

            <div className="page-title">Entrée</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.inflow && !this.state.updating && <>
                <div>Personne : <Link href={"/people/" + this.state.inflow.person.id}>{this.state.inflow.person.name}</Link></div>
                <div>Source : {this.state.inflow.fromName ?? <Link href={"/people/" + this.state.inflow.fromBusiness.id}>{this.state.inflow.fromBusiness.name}</Link>}</div>
                <div>Montant : {numberFormat.format(this.state.inflow.amount)}</div>
                {!!this.state.inflow.fees && <div>Frais : {numberFormat.format(this.state.inflow.fees)}</div>}
                {!!this.state.inflow.fees && <div>Montant payé : {numberFormat.format(this.state.inflow.amount + this.state.inflow.fees)}</div>}
                <div>Description : {this.state.inflow.description ?? "Non précisée"}</div>
                <div>Dates : {this.state.inflow.startDate ? `${moment(this.state.inflow.startDate).format("DD/MM/YYYY")} -> ${moment(this.state.inflow.endDate).format("DD/MM/YYYY")}` : "Non précisées"}</div>
                <div>Date : {moment(this.state.inflow.date).format("DD/MM/YYYY")}</div>

                <br />
                <div className="buttons">
                    <button disabled={this.state.requesting} onClick={() => this.setState({ updating: true })}>Modifier</button>
                    <button disabled={this.state.requesting} onClick={handleDelete}>Supprimer</button>
                </div>
            </>}

            {this.state.inflow && this.state.updating && <div className="form">
                <CreateInflowForm ref={this.formRef} defaultValue={this.state.inflow}
                    disabled={this.state.requesting} autoFocus onEnter={handleUpdate} />
                <div className="buttons">
                    <button disabled={this.state.requesting} onClick={() => this.setState({ updating: false, info: null })}>Annuler</button>
                    <button disabled={this.state.requesting} onClick={handleUpdate}>Sauvegarder</button>
                </div>
            </div>}

        </div>;
    }
}

export default (props) => <Inflow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
