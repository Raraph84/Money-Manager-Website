"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info } from "../utils";
import { getInflows } from "../../api";
import moment from "moment";

class Inflows extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, inflows: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getInflows(["person", "fromBusiness"]).then((inflows) => {
            this.setState({ requesting: false, inflows });
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

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div className="page-title">Entrées</div>

            {this.state.inflows && <table>
                <thead>
                    <tr>
                        <th>Personne</th>
                        <th>Source</th>
                        <th>Montant</th>
                        <th>Description</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.inflows.map((inflow) => <tr key={inflow.id}>
                        <td>{inflow.person.name}</td>
                        <td>{inflow.fromName ?? inflow.fromBusiness.name}</td>
                        <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(inflow.amount)}</td>
                        <td>{inflow.description}</td>
                        <td>{moment(inflow.date).format("DD/MM/YYYY")}</td>
                    </tr>)}
                </tbody>
            </table>}

        </div>;
    }
}

export default (props) => <Inflows {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
