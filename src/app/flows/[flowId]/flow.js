"use client";

import { Component, createRef } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info, ChooseOutflowForm, ChooseInflowForm, LinkedTr } from "../../../utils";
import { createFlowLink, deleteFlowLink, getFlow } from "../../../api";
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

            createFlowLink(this.state.flow.id, { ...flowLink, inflow: flowLink.inflow?.id ?? null, outflow: flowLink.outflow?.id ?? null })
                .then((id) => this.setState({ requesting: false, addingFlow: false, flow: { ...this.state.flow, links: [...this.state.flow.links, { ...flowLink, id }] } }))
                .catch(() => this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> }));
        };

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        return <div>

            <div className="page-title">Transaction</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.flow && <>

                {this.state.flow.fromAccount && <div>Source : {this.state.flow.fromAccount.name}</div>}
                {this.state.flow.toAccount && <div>Destination : {this.state.flow.toAccount.name}</div>}
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
                                    <td>{flowLink.inflow.description ?? "N/A"}</td>
                                    <td>{flowLink.inflow.startDate && flowLink.inflow.endDate ? `${moment(flowLink.inflow.startDate).format("DD/MM/YYYY")} -> ${moment(flowLink.inflow.endDate).format("DD/MM/YYYY")}` : "N/A"}</td>
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
                                    <td>{flowLink.outflow.description ?? "N/A"}</td>
                                    <td>{flowLink.outflow.startDate && flowLink.outflow.endDate ? `${moment(flowLink.outflow.startDate).format("DD/MM/YYYY")} -> ${moment(flowLink.outflow.endDate).format("DD/MM/YYYY")}` : "N/A"}</td>
                                    <td>{moment(flowLink.outflow.date).format("DD/MM/YYYY")}</td>
                                    <td><button disabled={this.state.requesting} onClick={() => handleRemoveFlow(flowLink)}>Supprimer</button></td>
                                </LinkedTr>)}
                            </tbody>
                        </table>
                    </div> : <div>Aucune sortie liée</div>}
                </>}

                {(!this.state.flow.fromAccount || !this.state.flow.toAccount) && <>

                    <br />
                    {this.state.addingFlow ? <div className="form">

                        {!this.state.flow.fromAccount
                            ? <ChooseInflowForm ref={this.flowFormRef} disabled={this.state.requesting}
                                onEnter={() => this.flowFormRef.current.choose(false).then(({ amount }) => { this.amountInputRef.current.value = amount.toFixed(2).replace(".", ","); this.amountInputRef.current.focus(); })} />
                            : <ChooseOutflowForm ref={this.flowFormRef} disabled={this.state.requesting}
                                onEnter={() => this.flowFormRef.current.choose(false).then(({ amount }) => { this.amountInputRef.current.value = amount.toFixed(2).replace(".", ","); this.amountInputRef.current.focus(); })} />}

                        <div>Montant</div>
                        <input ref={this.amountInputRef} disabled={this.state.requesting}
                            onKeyDown={(event) => event.key === "Enter" && handleAddFlow()}
                            onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                            onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

                        <button disabled={this.state.requesting} onClick={handleAddFlow}>Ajouter</button>

                    </div> : <button disabled={this.state.requesting} onClick={() => this.setState({ addingFlow: true })}>Ajouter une {!this.state.flow.fromAccount ? "entrée" : "sortie"}</button>}

                </>}

            </>}

        </div>;
    }
}

export default (props) => <Flow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
