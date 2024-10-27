import { Component, createRef } from "react";
import { createPerson, createAccount, createBusiness, getPeople, getAccounts, getBusinesses, createInflow, createOutflow, createFlow, getInflows, getOutflows } from "./api";
import Link from "next/link";

export const Loading = () => {
    window.scrollTo(0, 0);
    return <div className="loading"><i className="fa-solid fa-spinner" /></div>;
};

export const Info = ({ children }) => {
    window.scrollTo(0, 0);
    return <div className="info">{children}</div>;
};

export const LinkedTr = ({ children, href }) => <tr className="linked">
    {(Array.isArray(children) ? children : [children]).map((child, index) => <td key={index}><Link href={href}>{child.props.children}</Link></td>)}
</tr>;

class NameForm extends Component {

    constructor(props) {

        super(props);

        this.nameInputRef = createRef();
    }

    async create(create = true) {

        const obj = { name: this.nameInputRef.current.value };

        if (create) {
            try {
                obj.id = await this.props.onCreate(obj);
            } catch (error) {
                if (error === "Name must be between 2 and 50 characters")
                    throw { info: <Info>Le nom doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.nameInputRef.current.focus() };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return obj;
    }

    render() {
        return <>
            <div>{(this.props.names ?? []).concat("Nom").join(" - ")}</div>
            <input ref={this.nameInputRef} disabled={this.props.disabled} autoFocus={this.props.autoFocus}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />
        </>;
    }
}

export const CreatePersonForm = (props) => <NameForm {...props} onCreate={createPerson} />;

export const CreateAccountForm = (props) => <NameForm {...props} onCreate={createAccount} />;

export const CreateBusinessForm = (props) => <NameForm {...props} onCreate={createBusiness} />;

class ChooseForm extends Component {

    constructor(props) {

        super(props);

        this.formRef = createRef();

        this.state = { options: null, selected: null };
    }

    componentDidMount() {
        this.props.getOptions().then((options) => this.setState({ options })).catch(() => { });
    }

    async choose(create = true) {

        if (!this.state.selected) throw { info: <Info>Veuillez choisir une {this.props.name.toLowerCase()} !</Info> };

        if (this.state.selected > 0) return this.state.options.find((option) => option.id === this.state.selected);

        const option = await this.formRef.current.create(create);

        if (create)
            await new Promise((resolve) => this.setState({ options: [...this.state.options, option], selected: option.id }, resolve));

        return option;
    }

    render() {
        const getName = (option) => option && this.props.getName ? this.props.getName(option) : option?.name;
        return <>

            <div>{(this.props.names ?? []).concat(this.props.name).join(" - ")}</div>

            <div className="choose-list">
                {!this.state.selected ? <>
                    <button disabled={this.props.disabled} onClick={() => this.setState({ selected: -1 })}>Créer</button>
                    {this.state.options?.map((option) => <button key={option.id} disabled={this.props.disabled}
                        onClick={() => this.setState({ selected: option.id }, this.props.onEnter)}>{getName(option)}</button>)}
                </> : <>
                    <button disabled={this.props.disabled} className="selected"
                        onClick={() => this.setState({ selected: null })}>{getName(this.state.options.find((option) => option.id === this.state.selected)) ?? "Créer"}</button>
                </>}
            </div>

            {this.state.selected && this.state.selected < 0 && this.props.getForm({ ref: this.formRef, disabled: this.props.disabled, autoFocus: true, names: (this.props.names ?? []).concat(this.props.name), onEnter: this.props.onEnter })}

        </>;
    }
}

const ChoosePersonForm = (props) => <ChooseForm name="Personne" getOptions={getPeople} getForm={(props) => <CreatePersonForm {...props} />} {...props} />;

const ChooseAccountForm = (props) => <ChooseForm name="Compte" getOptions={getAccounts} getForm={(props) => <CreateAccountForm {...props} />} {...props} />;

const ChooseBusinessForm = (props) => <ChooseForm name="Entreprise" getOptions={getBusinesses} getForm={(props) => <CreateBusinessForm {...props} />} {...props} />;

export class CreateInflowForm extends Component {

    constructor(props) {

        super(props);

        this.personFormRef = createRef();
        this.fromBusinessFormRef = createRef();
        this.fromNameInputRef = createRef();
        this.amountInputRef = createRef();
        this.descriptionInputRef = createRef();
        this.startDateInputRef = createRef();
        this.endDateInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { fromBusiness: true };
    }

    async create(create = true) {

        const inflow = {};

        inflow.person = await this.personFormRef.current.choose(create);
        if (this.state.fromBusiness) inflow.fromBusiness = await this.fromBusinessFormRef.current.choose(create);
        else inflow.fromName = this.fromNameInputRef.current.value;
        inflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        inflow.description = this.descriptionInputRef.current.value || null;
        inflow.startDate = this.startDateInputRef.current.value ? new Date(this.startDateInputRef.current.value).getTime() : null;
        inflow.endDate = this.endDateInputRef.current.value ? new Date(this.endDateInputRef.current.value).getTime() : null;
        inflow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(inflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        if (create) {
            try {
                inflow.id = await createInflow({ ...inflow, person: inflow.person.id, fromBusiness: inflow.fromBusiness?.id });
            } catch (error) {
                if (error === "From name must be between 2 and 50 characters")
                    throw { info: <Info>Le nom de la source doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.fromNameInputRef.current.focus() };
                else if (error === "Description must be between 2 and 100 characters")
                    throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return inflow;
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} names={this.props.names} onEnter={() => { }} />

            <div>{(this.props.names ?? []).concat("Source").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.fromBusiness ? "" : "selected"} onClick={() => this.setState({ fromBusiness: false })}>Nom</button>
                <button disabled={this.props.disabled} className={this.state.fromBusiness ? "selected" : ""} onClick={() => this.setState({ fromBusiness: true })}>Entreprise</button>
            </div>

            {this.state.fromBusiness ? <ChooseBusinessForm ref={this.fromBusinessFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Source")}
                onEnter={() => this.amountInputRef.current.focus()} /> : <>
                <div>{(this.props.names ?? []).concat("Source", "Nom").join(" - ")}</div>
                <input ref={this.fromNameInputRef} disabled={this.props.disabled} autoFocus
                    onKeyDown={(event) => event.key === "Enter" && this.amountInputRef.current.focus()} />
            </>}

            <div>{(this.props.names ?? []).concat("Montant").join(" - ")}</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>{(this.props.names ?? []).concat("Description").join(" - ")}</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de début").join(" - ")}</div>
            <input ref={this.startDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de fin").join(" - ")}</div>
            <input ref={this.endDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}

export class CreateOutflowForm extends Component {

    constructor(props) {

        super(props);

        this.personFormRef = createRef();
        this.toNameInputRef = createRef();
        this.toBusinessFormRef = createRef();
        this.amountInputRef = createRef();
        this.descriptionInputRef = createRef();
        this.startDateInputRef = createRef();
        this.endDateInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { toBusiness: true };
    }

    async create(create = true) {

        const outflow = {};

        outflow.person = await this.personFormRef.current.choose(create);
        if (this.state.toBusiness) outflow.toBusiness = await this.toBusinessFormRef.current.choose(create);
        else outflow.toName = this.toNameInputRef.current.value;
        outflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        outflow.description = this.descriptionInputRef.current.value || null;
        outflow.startDate = this.startDateInputRef.current.value ? new Date(this.startDateInputRef.current.value).getTime() : null;
        outflow.endDate = this.endDateInputRef.current.value ? new Date(this.endDateInputRef.current.value).getTime() : null;
        outflow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(outflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        if (create) {
            try {
                outflow.id = await createOutflow({ ...outflow, person: outflow.person.id, toBusiness: outflow.toBusiness?.id });
            } catch (error) {
                if (error === "To name must be between 2 and 50 characters")
                    throw { info: <Info>Le nom de la destination doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.toNameInputRef.current.focus() };
                else if (error === "Description must be between 2 and 100 characters")
                    throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return outflow;
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} onEnter={() => { }} />

            <div>{(this.props.names ?? []).concat("Destination").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.toBusiness ? "" : "selected"} onClick={() => this.setState({ toBusiness: false })}>Nom</button>
                <button disabled={this.props.disabled} className={this.state.toBusiness ? "selected" : ""} onClick={() => this.setState({ toBusiness: true })}>Entreprise</button>
            </div>

            {this.state.toBusiness ? <ChooseBusinessForm ref={this.toBusinessFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Destination")}
                onEnter={() => this.amountInputRef.current.focus()} /> : <>
                <div>{(this.props.names ?? []).concat("Destination", "Nom").join(" - ")}</div>
                <input ref={this.toNameInputRef} disabled={this.props.disabled} autoFocus
                    onKeyDown={(event) => event.key === "Enter" && this.amountInputRef.current.focus()} />
            </>}

            <div>{(this.props.names ?? []).concat("Montant").join(" - ")}</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>{(this.props.names ?? []).concat("Description").join(" - ")}</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de début").join(" - ")}</div>
            <input ref={this.startDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de fin").join(" - ")}</div>
            <input ref={this.endDateInputRef} type="date" disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}

const ChooseInflowForm = (props) => <ChooseForm name="Entrée" getOptions={() => getInflows(["person", "fromBusiness"])} getForm={(props) => <CreateInflowForm {...props} />} {...props}
    getName={(inflow) => `${inflow?.fromName ?? inflow?.fromBusiness?.name} -> ${inflow.person.name} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(inflow.amount)}`} />;

const ChooseOutflowForm = (props) => <ChooseForm name="Sortie" getOptions={() => getOutflows(["person", "toBusiness"])} getForm={(props) => <CreateOutflowForm {...props} />} {...props}
    getName={(outflow) => `${outflow.person.name} -> ${outflow?.toName ?? outflow?.toBusiness?.name} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(outflow.amount)}`} />;

export class CreateFlowForm extends Component {

    constructor(props) {

        super(props);

        this.inflowFormRef = createRef();
        this.fromAccountFormRef = createRef();
        this.outflowFormRef = createRef();
        this.toAccountFormRef = createRef();
        this.amountInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { fromAccount: true, toAccount: false };
    }

    async create(create = true) {

        const flow = {};

        if (this.state.fromAccount) flow.fromAccount = await this.fromAccountFormRef.current.choose(create);
        else flow.fromAccount = await this.inflowFormRef.current.choose(create);
        if (this.state.toAccount) flow.toAccount = await this.toAccountFormRef.current.choose(create);
        else flow.toAccount = await this.outflowFormRef.current.choose(create);
        flow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        flow.date = new Date(this.dateInputRef.current.value).getTime();

        if (isNaN(flow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!this.dateInputRef.current.value) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        try {
            return await createFlow({ ...flow, fromAccount: flow.fromAccount?.id, toAccount: flow.toAccount?.id });
        } catch (error) {
            if (error === "From and to accounts must be different")
                throw { info: <Info>Les comptes source et destination doivent être différents !</Info> };
            else
                throw { info: <Info>Un problème est survenu !</Info> };
        }
    }

    render() {
        return <>

            <div>{(this.props.names ?? []).concat("Source").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.fromAccount ? "" : "selected"} onClick={() => this.setState({ fromAccount: false, toAccount: true })}>Entrée</button>
                <button disabled={this.props.disabled} className={this.state.fromAccount ? "selected" : ""} onClick={() => this.setState({ fromAccount: true })}>Compte</button>
            </div>

            {this.state.fromAccount
                ? <ChooseAccountForm ref={this.fromAccountFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Source")}
                    onEnter={() => { }} />
                : <ChooseInflowForm ref={this.inflowFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Source")}
                    onEnter={() => this.inflowFormRef.current.choose(false).then((inflow) => this.amountInputRef.current.value = inflow.amount.toFixed(2).replace(".", ","))} />}

            <div>{(this.props.names ?? []).concat("Destination").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.toAccount ? "" : "selected"} onClick={() => this.setState({ toAccount: false, fromAccount: true })}>Sortie</button>
                <button disabled={this.props.disabled} className={this.state.toAccount ? "selected" : ""} onClick={() => this.setState({ toAccount: true })}>Compte</button>
            </div>

            {this.state.toAccount
                ? <ChooseAccountForm ref={this.toAccountFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Destination")}
                    onEnter={() => this.amountInputRef.current.focus()} />
                : <ChooseOutflowForm ref={this.outflowFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Destination")}
                    onEnter={() => this.outflowFormRef.current.choose(false).then((outflow) => this.amountInputRef.current.value = outflow.amount.toFixed(2).replace(".", ","))} />}

            <div>{(this.props.names ?? []).concat("Montant").join(" - ")}</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()}
                onBlur={(event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") }}
                onInput={(event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1")} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} type="datetime-local" disabled={this.props.disabled} defaultValue={new Date().toISOString().slice(0, 16)}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter()} />

        </>;
    }
}
