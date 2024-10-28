"use client";

import { Component } from "react";
import { usePathname, useSearchParams, useRouter, useParams } from "next/navigation";
import { Loading, Info } from "../../../utils";
import { getBusiness } from "../../../api";

class Business extends Component {

    constructor(props) {

        super(props);

        this.state = { requesting: false, info: null, business: null };
    }

    componentDidMount() {

        this.setState({ requesting: true });
        getBusiness(this.props.params.businessId).then((business) => {
            this.setState({ requesting: false, business });
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

            <div className="page-title">Entreprise</div>

            {this.state.requesting && <Loading />}
            {this.state.info}

            {this.state.business && <>
                <div>Nom : {this.state.business.name}</div>
            </>}

        </div>;
    }
}

export default (props) => <Business {...props} pathname={usePathname()} searchParams={useSearchParams()} router={useRouter()} params={useParams()} />;
