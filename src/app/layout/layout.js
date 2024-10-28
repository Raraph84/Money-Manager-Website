"use client";

import { Component, createRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

class HeaderClass extends Component {

    constructor(props) {

        super(props);

        this.menuRef = createRef();
        this.handleClickOutsideListener = null;

        this.state = { logged: true, menu: null };
    }

    componentDidMount() {

        this.setState({ logged: !!localStorage.getItem("token") });

        this.handleClickOutsideListener = this.handleClickOutside.bind(this);
        document.addEventListener("mouseup", this.handleClickOutsideListener);
    }

    componentDidUpdate(prevProps) {
        if (this.props.pathname !== prevProps.pathname)
            this.setState({ logged: !!localStorage.getItem("token") });
    }

    componentWillUnmount() {
        document.removeEventListener("mouseup", this.handleClickOutsideListener);
    }

    handleClickOutside(event) {
        if (this.state.menu && !this.menuRef.current.contains(event.target))
            this.setState({ menu: null });
    }

    updateMenuPosition() {
        if (!this.state.menu) return;
        const menu = this.menuRef.current.querySelector("div");
        menu.classList.remove("right");
        if (this.menuRef.current.offsetLeft + menu.offsetWidth > window.innerWidth)
            menu.classList.add("right");
    }

    render() {

        if (!this.state.logged) return null;

        const setMenu = (menu) => this.setState({ menu: this.state.menu === menu ? null : menu }, this.updateMenuPosition);

        return <header>
            <Link href="/">Accueil</Link>
            <Link href="/flows/create">Créer</Link>
            <div className="menu" ref={this.state.menu === "flows" ? this.menuRef : null}>
                <button onClick={() => setMenu("flows")}>Transactions</button>
                {this.state.menu === "flows" && <div>
                    <Link href="/flows" onClick={() => setMenu(null)}>Transactions</Link>
                    <Link href="/inflows" onClick={() => setMenu(null)}>Entrées</Link>
                    <Link href="/outflows" onClick={() => setMenu(null)}>Sorties</Link>
                </div>}
            </div>
            <div className="menu" ref={this.state.menu === "entities" ? this.menuRef : null}>
                <button onClick={() => setMenu("entities")}>Entités</button>
                {this.state.menu === "entities" && <div>
                    <Link href="/people" onClick={() => setMenu(null)}>Personnes</Link>
                    <Link href="/accounts" onClick={() => setMenu(null)}>Comptes</Link>
                    <Link href="/businesses" onClick={() => setMenu(null)}>Entreprises</Link>
                </div>}
            </div>
        </header>;
    }
}

export const Header = (props) => <HeaderClass {...props} pathname={usePathname()} router={useRouter()} />;
