"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info, LinkedTr } from "../../utils";
import { getOutflows } from "../../api";
import Link from "next/link";
import moment from "moment";

class Outflows extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, outflows: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getOutflows(["person", "toBusiness"]).then((outflows) => {
            this.setState({ requesting: false, outflows });
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

            <div className="page-title">Sorties</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <Link href="/outflows/create" className="create-button">Créer une sortie</Link>

            {this.state.outflows && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Personne</th>
                            <th>Destination</th>
                            <th>Montant</th>
                            <th>Description</th>
                            <th>Dates</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.outflows.map((outflow) => <LinkedTr key={outflow.id} href={"/outflows/" + outflow.id}>
                            <td>{outflow.person.name}</td>
                            <td>{outflow.toName ?? outflow.toBusiness.name}</td>
                            <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(outflow.amount)}</td>
                            <td>{outflow.description ?? "N/A"}</td>
                            <td>{outflow.startDate ? `${moment(outflow.startDate).format("DD/MM/YYYY")} -> ${moment(outflow.endDate).format("DD/MM/YYYY")}` : "N/A"}</td>
                            <td>{moment(outflow.date).format("DD/MM/YYYY")}</td>
                        </LinkedTr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <Outflows {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
