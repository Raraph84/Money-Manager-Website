"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info, LinkedTr } from "../../utils";
import { getFlows } from "../../api";
import Link from "next/link";
import moment from "moment";

class Flows extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, flows: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getFlows(["inflow", "inflow.fromBusiness", "fromAccount", "outflow", "outflow.toBusiness", "toAccount"]).then((flows) => {
            this.setState({ requesting: false, flows });
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

            <div className="page-title">Transactions</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <Link href="/flows/create" className="create-button">Créer une transaction</Link>

            {this.state.flows && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Destination</th>
                            <th>Montant</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.flows.map((flow) => <LinkedTr key={flow.id} href={"/flows/" + flow.id}>
                            <td>{flow.fromAccount ? flow.fromAccount.name : (flow.inflow.fromName ?? flow.inflow.fromBusiness.name)}</td>
                            <td>{flow.toAccount ? flow.toAccount.name : flow.outflow.toBusiness.name}</td>
                            <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(flow.amount)}</td>
                            <td>{moment(flow.date).format("DD/MM/YYYY")}</td>
                        </LinkedTr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <Flows {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
