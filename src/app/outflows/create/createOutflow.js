"use client";

import { Component, createRef } from "react";
import { useRouter } from "next/navigation";
import { Loading, CreateOutflowForm } from "../../../utils";

class CreateOutflow extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { requesting: false, info: null };
    }

    render() {

        const createHandler = () => {
            this.setState({ requesting: true, info: null });
            this.formRef.current.create()
                .then(() => this.props.router.push("/outflows"))
                .catch(({ info, cb }) => this.setState({ requesting: false, info }, cb));
        };

        return <div className="form-page">

            <div className="page-title">Créer une sortie</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            <div className="form">
                <CreateOutflowForm ref={this.formRef} disabled={this.state.requesting} autoFocus onEnter={createHandler} />
                <button disabled={this.state.requesting} onClick={createHandler}>Créer</button>
            </div>

        </div>;
    }
}

export default (props) => <CreateOutflow {...props} router={useRouter()} />;
