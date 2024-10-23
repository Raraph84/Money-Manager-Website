"use client";

import { Component, createRef } from "react";
import { useRouter } from "next/navigation";
import { Loading, CreateAccountForm } from "../../../utils";

class CreateAccount extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null };
    }

    render() {

        const createHandler = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then(() => this.props.router.push("/accounts"))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        return <div className="form-page">

            <div className="page-title">Créer un compte</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <CreateAccountForm ref={this.formRef} disabled={this.state.requesting} autoFocus onEnter={createHandler} />

            <button disabled={this.state.requesting} onClick={createHandler}>Créer</button>

        </div>;
    }
}

export default (props) => <CreateAccount {...props} router={useRouter()} />;
