"use client";

import { Component, createRef } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info, ChooseOutflowForm, ChooseInflowForm, LinkedTr, amountInputEvents } from "../../../utils";
import { getFlow, deleteFlow, deleteFlowLink, createFlowLink } from "../../../api";
import Link from "next/link";
import moment from "moment";

class Flow extends Component {

    constructor(props) {

        super(props);

        this.flowFormRef = createRef();
        this.amountInputRef = createRef();

        this.state = { requesting: false, info: null, flow: null, addingFlow: false };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getFlow(this.props.params.flowId, ["fromAccount", "toAccount", "links", "links.inflow", "links.inflow.person", "links.inflow.fromBusiness", "links.outflow", "links.outflow.person", "links.outflow.toBusiness"]).then((flow) => {
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

        const handleDelete = () => {

            if (!confirm("Voulez-vous vraiment supprimer cette transaction ?")) return;

            this.setState({ requesting: true, info: null });
            deleteFlow(this.state.flow.id)
                .then(() => this.props.router.push("/flows"))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const handleRemoveFlow = (flowLink) => {

            if (!confirm("Voulez-vous vraiment supprimer ce lien de transaction ?")) return;

            this.setState({ requesting: true, info: null });
            deleteFlowLink(this.state.flow.id, flowLink.id)
                .then(() => this.setState({ requesting: false, flow: { ...this.state.flow, links: this.state.flow.links.filter((link) => link !== flowLink) } }))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const handleAddFlow = async () => {

            this.setState({ requesting: true, info: null });

            let flow;
            try {
                flow = await this.flowFormRef.current.choose();
            } catch (error) {
                this.setState({ requesting: false, info: error.info }, error.cb);
                return;
            }

            const flowLink = {
                inflow: !this.state.flow.fromAccount ? flow : null,
                outflow: !this.state.flow.toAccount ? flow : null,
                amount: parseFloat(this.amountInputRef.current.value.replace(",", "."))
            };

            if (isNaN(flowLink.amount)) {
                this.setState({ requesting: false, info: <Info>Le montant doit être un nombre !</Info> }, () => this.amountInputRef.current.focus());
                return;
            }

            createFlowLink(this.state.flow.id, { ...flowLink, inflow: flowLink.inflow?.id ?? null, outflow: flowLink.outflow?.id ?? null })
                .then((id) => this.setState({ requesting: false, addingFlow: false, flow: { ...this.state.flow, links: [...this.state.flow.links, { ...flowLink, id }] } }))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        const total = this.state.flow?.links.reduce((acc, link) => acc + (link.inflow?.amount ?? link.outflow?.amount ?? 0), 0);

        return <div>

            <div className="page-title">Transaction</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.flow && <>

                {this.state.flow.fromAccount && <div>Source : <Link href={"/accounts/" + this.state.flow.fromAccount.id}>{this.state.flow.fromAccount.name}</Link></div>}
                {this.state.flow.toAccount && <div>Destination : <Link href={"/accounts/" + this.state.flow.toAccount.id}>{this.state.flow.toAccount.name}</Link></div>}
                <div>Montant : {numberFormat.format(this.state.flow.amount)}</div>
                <div>Date : {moment(this.state.flow.date).format("DD/MM/YYYY")}</div>

                {!this.state.flow.fromAccount && <>
                    <br />
                    <div>Entrées :</div>
                    {this.state.flow.links.length ? <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Personne</th>
                                    <th>Source</th>
                                    <th>Montant</th>
                                    <th>Description</th>
                                    <th>Dates</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.flow.links.map((flowLink) => <LinkedTr key={flowLink.inflow.id} href={"/inflows/" + flowLink.inflow.id} excludes={[6]}>
                                    <td>{flowLink.inflow.person.name}</td>
                                    <td>{flowLink.inflow.fromName ?? flowLink.inflow.fromBusiness.name}</td>
                                    <td>{numberFormat.format(flowLink.inflow.amount)}</td>
                                    <td>{flowLink.inflow.description ?? "Non précisée"}</td>
                                    <td>{flowLink.inflow.startDate && flowLink.inflow.endDate ? `${moment(flowLink.inflow.startDate).format("DD/MM/YYYY")} -> ${moment(flowLink.inflow.endDate).format("DD/MM/YYYY")}` : "Non précisées"}</td>
                                    <td>{moment(flowLink.inflow.date).format("DD/MM/YYYY")}</td>
                                    <td><button disabled={this.state.requesting} onClick={() => handleRemoveFlow(flowLink)}>Supprimer</button></td>
                                </LinkedTr>)}
                            </tbody>
                        </table>
                    </div> : <div>Aucune entrée liée</div>}
                </>}

                {!this.state.flow.toAccount && <>
                    <br />
                    <div>Sorties :</div>
                    {this.state.flow.links.length ? <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Personne</th>
                                    <th>Destination</th>
                                    <th>Montant</th>
                                    <th>Description</th>
                                    <th>Dates</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.flow.links.map((flowLink) => <LinkedTr key={flowLink.outflow.id} href={"/outflows/" + flowLink.outflow.id} excludes={[6]}>
                                    <td>{flowLink.outflow.person.name}</td>
                                    <td>{flowLink.outflow.toName ?? flowLink.outflow.toBusiness.name}</td>
                                    <td>{numberFormat.format(flowLink.outflow.amount)}</td>
                                    <td>{flowLink.outflow.description ?? "Non précisée"}</td>
                                    <td>{flowLink.outflow.startDate && flowLink.outflow.endDate ? `${moment(flowLink.outflow.startDate).format("DD/MM/YYYY")} -> ${moment(flowLink.outflow.endDate).format("DD/MM/YYYY")}` : "Non précisées"}</td>
                                    <td>{moment(flowLink.outflow.date).format("DD/MM/YYYY")}</td>
                                    <td><button disabled={this.state.requesting} onClick={() => handleRemoveFlow(flowLink)}>Supprimer</button></td>
                                </LinkedTr>)}
                            </tbody>
                        </table>
                    </div> : <div>Aucune sortie liée</div>}
                </>}

                {this.state.addingFlow && <>
                    <br />
                    <div className="form">

                        {!this.state.flow.fromAccount
                            ? <ChooseInflowForm ref={this.flowFormRef} disabled={this.state.requesting}
                                onEnter={() => this.flowFormRef.current.choose(false).then(({ amount }) => this.amountInputRef.current.value = amount.toFixed(2).replace(".", ",")).catch(() => { }).finally(() => this.amountInputRef.current.focus())} />
                            : <ChooseOutflowForm ref={this.flowFormRef} disabled={this.state.requesting}
                                onEnter={() => this.flowFormRef.current.choose(false).then(({ amount }) => this.amountInputRef.current.value = amount.toFixed(2).replace(".", ",")).catch(() => { }).finally(() => this.amountInputRef.current.focus())} />}

                        <div>Montant</div>
                        <input ref={this.amountInputRef} disabled={this.state.requesting} {...amountInputEvents}
                            onKeyDown={(event) => event.key === "Enter" && handleAddFlow()} />

                        <div className="buttons">
                            <button disabled={this.state.requesting} onClick={() => this.setState({ addingFlow: false })}>Annuler</button>
                            <button disabled={this.state.requesting} onClick={handleAddFlow}>Ajouter</button>
                        </div>

                    </div>
                </>}

                <br />
                <div className="buttons">
                    {(!this.state.flow.fromAccount || !this.state.flow.toAccount) && !this.state.addingFlow && total !== this.state.flow.amount &&
                        <button disabled={this.state.requesting} onClick={() => this.setState({ addingFlow: true })}>Ajouter une {!this.state.flow.fromAccount ? "entrée" : "sortie"}</button>}
                    <button disabled={this.state.requesting} onClick={handleDelete}>Supprimer</button>
                </div>

            </>}

        </div>;
    }
}

export default (props) => <Flow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
