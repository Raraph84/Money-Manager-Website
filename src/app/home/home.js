"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loading, Info } from "../../utils";
import { getPeople, getAccounts } from "../../api";

class Home extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, people: null, accounts: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        Promise.all([
            getPeople().then((people) => {
                this.setState({ people });
            }).catch((error) => {
                if (error === "Invalid token") {
                    localStorage.removeItem("token");
                    this.props.router.push("/login?" + new URLSearchParams([["redirectUrl", this.props.pathname + this.props.searchParams.toString()]]).toString());
                } else
                    this.setState({ info: <Info>Un problème est survenu !</Info> });
            }),
            getAccounts()
                .then((accounts) => this.setState({ accounts }))
                .catch(() => this.setState({ info: <Info>Un problème est survenu !</Info> }))
        ]).then(() => this.setState({ requesting: false }));
    }

    render() {

        const logoutHandler = () => {
            if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;
            logout().then(() => {
                localStorage.removeItem("token");
                this.props.router.push("/login");
            }).catch(() => { });
        };

        const numberFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

        return <div className="home-page">

            <div className="page-title">Accueil</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.people && <div className="balance">
                <div className="title">Solde</div>
                <div>{numberFormat.format(this.state.people[0].balance)}</div>
            </div>}

            {this.state.people && <div className="people-accounts">
                <div className="title">Personnes</div>
                <div className="list">{this.state.people.slice(1).map((person) => <div key={person.id}>
                    <div className="">{person.name}</div>
                    <div>{numberFormat.format(person.balance)}</div>
                </div>)}</div>
            </div>}

            {this.state.accounts && <div className="people-accounts">
                <div className="title">Comptes</div>
                <div className="list">{this.state.accounts.map((account) => <div key={account.id}>
                    <div>{account.name}</div>
                    <div>{numberFormat.format(account.balance)}</div>
                </div>)}</div>
            </div>}

            <button onClick={logoutHandler}>Se déconnecter</button>

        </div>;
    }
}

export default (props) => <Home {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} />;
