"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getPerson, getInflows, getOutflows } from "../../../api";
import Link from "next/link";
import moment from "moment";

class Person extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, person: null, inflows: null, outflows: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        Promise.all([
            getPerson(this.props.params.personId).then((person) => {
                this.setState({ requesting: false, person });
            }).catch((error) => {
                if (error === "Invalid token") {
                    localStorage.removeItem("token");
                    this.props.router.push("/login?" + new URLSearchParams([["redirectUrl", this.props.pathname + this.props.searchParams.toString()]]).toString());
                } else
                    this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> });
            }),
            getInflows(["person", "fromBusiness"], [this.props.params.personId])
                .then((inflows) => this.setState({ inflows }))
                .catch(() => this.setState({ info: <Info>Un problème est survenu !</Info> })),
            getOutflows(["person", "toBusiness"], [this.props.params.personId])
                .then((outflows) => this.setState({ outflows }))
                .catch(() => this.setState({ info: <Info>Un problème est survenu !</Info> }))
        ]).then(() => this.setState({ requesting: false }));
    }

    render() {

        const flows = [];
        if (this.state.inflows) for (const inflow of this.state.inflows) flows.push({ type: "inflow", ...inflow });
        if (this.state.outflows) for (const outflow of this.state.outflows) flows.push({ type: "outflow", ...outflow });
        flows.sort((a, b) => b.date - a.date);

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        return <div>

            <div className="page-title">Personne</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.person && <>
                <div>Nom : {this.state.person.name}</div>
                <div>Solde : {numberFormat.format(this.state.person.balance)}</div>
            </>}

            {flows.length > 0 && <div className="flows">
                {flows.map((flow, i) => <Link key={i} href={`/${flow.type}s/${flow.id}`}>
                    <span>
                        {flow.type === "inflow"
                            ? <div>{flow.fromName ?? flow.fromBusiness.name}</div>
                            : <div>{flow.toName ?? flow.toBusiness.name}</div>}
                        {flow.description && <div>{flow.description}</div>}
                        {flow.startDate && <div>{moment(flow.startDate).format("DD/MM/YYYY")} {"->"} {moment(flow.endDate).format("DD/MM/YYYY")}</div>}
                    </span>
                    <span>
                        <div>
                            <div>{flow.type === "inflow" ? "+" : "-"}{numberFormat.format(flow.amount)}</div>
                            <div>{moment(flow.date).format("DD/MM/YYYY")}</div>
                        </div>
                    </span>
                </Link>)}
            </div>}

        </div>;
    }
}

export default (props) => <Person {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
