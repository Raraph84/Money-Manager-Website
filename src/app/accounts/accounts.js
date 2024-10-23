"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info, LinkedTr } from "../../utils";
import { getAccounts } from "../../api";
import Link from "next/link";

class Accounts extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, accounts: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getAccounts().then((accounts) => {
            this.setState({ requesting: false, accounts });
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

            <div className="page-title">Comptes</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <Link href="/accounts/create" className="create-button">Créer un compte</Link>

            {this.state.accounts && <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Solde</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.accounts.map((account) => <LinkedTr key={account.id} href={"/accounts/" + account.id}>
                            <td>{account.name}</td>
                            <td>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(account.balance)}</td>
                        </LinkedTr>)}
                    </tbody>
                </table>
            </div>}

        </div>;
    }
}

export default (props) => <Accounts {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
