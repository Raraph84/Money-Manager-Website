"use client";

import { Component, createRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loading, Info } from "../../utils";
import { login } from "../../api";

class Login extends Component {

    constructor(props) {

        super(props);

        this.passwordRef = createRef();

        this.state = { requesting: false, info: null };
    }

    componentDidMount() {

        if (localStorage.getItem("token"))
            this.props.router.push(this.props.searchParams.get("redirectUrl") ?? "/");
    }

    render() {

        const loginHandler = () => {

            this.setState({ requesting: true, info: null });
            login(this.passwordRef.current.value).then((token) => {
                localStorage.setItem("token", token);
                this.props.router.push(this.props.searchParams.get("redirectUrl") ?? "/");
            }).catch((error) => {
                if (error === "Too many fails")
                    this.setState({ requesting: false, info: <Info>Trop d'essais de connexion, réessaye plus tard !</Info> });
                else if (error === "Invalid password")
                    this.setState({ requesting: false, info: <Info>Mot de passe invalide !</Info> }, () => this.passwordRef.current.focus());
                else
                    this.setState({ requesting: false, info: <Info>Un problème est survenu !</Info> });
            });
        };

        return <div className="form-page">

            <div className="page-title">Connexion</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div>Mot de passe</div>
            <input ref={this.passwordRef} type="password" disabled={this.state.requesting} autoFocus
                onKeyDown={(event) => event.key === "Enter" && loginHandler()} />

            <button disabled={this.state.requesting} onClick={loginHandler}>Connexion</button>

        </div>;
    }
}

export default (props) => <Login {...props} searchParams={useSearchParams()} router={useRouter()} />;
