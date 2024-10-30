"use client";

import { Component, createRef } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info, ChooseOutflowForm, ChooseInflowForm } from "../../../utils";
import { createFlowLink, getFlow } from "../../../api";
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

        const handleAddFlow = async () => {

            this.setState({ requesting: true, info: null });

            let flow;
            try {
                flow = await this.flowFormRef.current.choose();
            } catch (error) {
                this.setState({ requesting: false, info: error.info }, error.cb);
                return;
            }

            const flowLink = {};
            flowLink.inflow = !this.state.flow.fromAccount ? flow : null;
            flowLink.outflow = !this.state.flow.toAccount ? flow : null;
            flowLink.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));

            try {
                flowLink.id = await createFlowLink(this.state.flow.id, { ...flowLink, inflow: flowLink.inflow?.id ?? null, outflow: flowLink.outflow?.id ?? null });
            } catch (error) {
                this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> });
                return;
            }

            this.setState({ requesting: false, addingFlow: false, flow: { ...this.state.flow, links: [...this.state.flow.links, flowLink] } });
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
                    <div className="flows">
                        {this.state.flow.links.map(({ inflow }, i) => <Link key={i} href={`/inflows/${inflow.id}`}>
                            <span>
                                <div>{inflow.fromName ?? inflow.fromBusiness.name}</div>
                                {inflow.description && <div>{inflow.description}</div>}
                                {inflow.startDate && <div>{moment(inflow.startDate).format("DD/MM/YYYY")} {"->"} {moment(inflow.endDate).format("DD/MM/YYYY")}</div>}
                            </span>
                            <span>
                                <div>
                                    <div>{numberFormat.format(inflow.amount)}</div>
                                    <div>{moment(inflow.date).format("DD/MM/YYYY")}</div>
                                </div>
                            </span>
                        </Link>)}
                    </div>

                    <br />
                    {this.state.addingFlow ? <div className="form">

                        <ChooseInflowForm ref={this.flowFormRef} disabled={this.state.requesting} onEnter={() => this.amountInputRef.current.focus()} />

                        <div>Montant</div>
                        <input ref={this.amountInputRef} disabled={this.state.requesting}
                            onKeyDown={(event) => event.key === "Enter" && handleAddFlow()}
                            onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                            onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

                        <button onClick={handleAddFlow}>Ajouter</button>

                    </div> : <button onClick={() => this.setState({ addingFlow: true })}>Ajouter une entrée</button>}
                </>}

                {!this.state.flow.toAccount && <>

                    <br />
                    <div>Sorties :</div>
                    <div className="flows">
                        {this.state.flow.links.map(({ outflow }, i) => <Link key={i} href={`/outflows/${outflow.id}`}>
                            <span>
                                <div>{outflow.toName ?? outflow.toBusiness.name}</div>
                                {outflow.description && <div>{outflow.description}</div>}
                                {outflow.startDate && <div>{moment(outflow.startDate).format("DD/MM/YYYY")} {"->"} {moment(outflow.endDate).format("DD/MM/YYYY")}</div>}
                            </span>
                            <span>
                                <div>
                                    <div>{numberFormat.format(outflow.amount)}</div>
                                    <div>{moment(outflow.date).format("DD/MM/YYYY")}</div>
                                </div>
                            </span>
                        </Link>)}
                    </div>

                    <br />
                    {this.state.addingFlow ? <div className="form">

                        <ChooseOutflowForm ref={this.flowFormRef} disabled={this.state.requesting} onEnter={() => this.amountInputRef.current.focus()} />

                        <div>Montant</div>
                        <input ref={this.amountInputRef} disabled={this.state.requesting}
                            onKeyDown={(event) => event.key === "Enter" && handleAddFlow()}
                            onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                            onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

                        <button onClick={handleAddFlow}>Ajouter</button>

                    </div> : <button onClick={() => this.setState({ addingFlow: true })}>Ajouter une sortie</button>}
                </>}

            </>}

        </div>;
    }
}

export default (props) => <Flow {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
