"use client";

import { Component, createRef } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info, CreateOutflowForm } from "../../../utils";
import { getOutflow, deleteOutflow } from "../../../api";
import Link from "next/link";
import moment from "moment";

class Outflow extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null, outflow: null, updating: false };
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

        const handleDelete = () => {

            if (!confirm("Voulez-vous vraiment supprimer cette sortie ?")) return;

            this.setState({ requesting: true, info: null });
            deleteOutflow(this.state.outflow.id)
                .then(() => this.props.router.push("/outflows"))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const handleUpdate = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then((outflow) => this.setState({ requesting: false, outflow, updating: false }))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        return <div>

            <div className="page-title">Sortie</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.outflow && !this.state.updating && <>
                <div>Personne : <Link href={"/people/" + this.state.outflow.person.id}>{this.state.outflow.person.name}</Link></div>
                <div>Destination : {this.state.outflow.toName ?? <Link href={"/people/" + this.state.outflow.toBusiness.id}>{this.state.outflow.toBusiness.name}</Link>}</div>
                <div>Montant : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(this.state.outflow.amount)}</div>
                <div>Description : {this.state.outflow.description ?? "Non précisée"}</div>
                <div>Dates : {this.state.outflow.startDate ? `${moment(this.state.outflow.startDate).format("DD/MM/YYYY")} -> ${moment(this.state.outflow.endDate).format("DD/MM/YYYY")}` : "Non précisées"}</div>
                <div>Date : {moment(this.state.outflow.date).format("DD/MM/YYYY")}</div>

                <br />
                <div className="buttons">
                    <button disabled={this.state.requesting} onClick={() => this.setState({ updating: true })}>Modifier</button>
                    <button disabled={this.state.requesting} onClick={handleDelete}>Supprimer</button>
                </div>
            </>}

            {this.state.outflow && this.state.updating && <div className="form">
                <CreateOutflowForm ref={this.formRef} defaultValue={this.state.outflow}
                    disabled={this.state.requesting} autoFocus onEnter={handleUpdate} />
                <div className="buttons">
                    <button disabled={this.state.requesting} onClick={() => this.setState({ updating: false, info: null })}>Annuler</button>
                    <button disabled={this.state.requesting} onClick={handleUpdate}>Sauvegarder</button>
                </div>
            </div>}

        </div>;
    }
}

export default (props) => <Outflow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
