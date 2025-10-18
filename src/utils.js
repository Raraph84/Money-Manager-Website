import { Component, createRef } from "react";
import { createPerson, createAccount, createBusiness, getPeople, getAccounts, getBusinesses, createInflow, createOutflow, getInflows, getOutflows, createFlow } from "./api";
import Link from "next/link";
import moment from "moment";

export const Loading = () => {
    window.scrollTo(0, 0);
    return <div className="loading"><i className="fa-solid fa-spinner" /></div>;
};

export const Info = ({ children }) => {
    window.scrollTo(0, 0);
    return <div className="info">{children}</div>;
};

export const LinkedTr = ({ children, href, excludes = [] }) => <tr className="linked">
    {(Array.isArray(children) ? children : [children]).filter((child) => child).map((child, index) => !excludes.includes(index) ? <td key={index}><Link href={href}>{child.props.children}</Link></td> : <td key={index}>{child.props.children}</td>)}
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
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter && this.props.onEnter()} enterKeyHint="next" />
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

const amountSort = (a, b) => {
    if (a.balance === 0 && b.balance === 0) return 0; // Both zero, maintain order
    if (a.balance === 0) return 1; // Move a to the end
    if (b.balance === 0) return -1; // Move b to the end
    return b.balance - a.balance; // Descending order
};

const ChoosePersonForm = (props) => <ChooseForm name="Personne"
    getOptions={() => getPeople().then((people) => people.sort(amountSort))}
    getForm={(props) => <CreatePersonForm {...props} />} {...props} />;

const ChooseAccountForm = (props) => <ChooseForm name="Compte"
    getOptions={() => getAccounts().then((accounts) => accounts.sort(amountSort))}
    getForm={(props) => <CreateAccountForm {...props} />} {...props} />;

const ChooseBusinessForm = (props) => <ChooseForm name="Entreprise" getOptions={getBusinesses}
    getForm={(props) => <CreateBusinessForm {...props} />} {...props} />;

export class CreateInflowForm extends Component {

    constructor(props) {

        super(props);

        this.personFormRef = createRef();
        this.fromBusinessFormRef = createRef();
        this.fromNameInputRef = createRef();
        this.amountInputRef = createRef();
        this.feesInputRef = createRef();
        this.descriptionInputRef = createRef();
        this.startDateInputRef = createRef();
        this.endDateInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { fromBusiness: true };
    }

    async create(create = true) {

        const inflow = {};
        inflow.person = await this.personFormRef.current.choose(create);
        inflow.fromBusiness = this.state.fromBusiness ? await this.fromBusinessFormRef.current.choose(create) : null;
        inflow.fromName = !this.state.fromBusiness ? this.fromNameInputRef.current.value : null;
        inflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        inflow.fees = this.feesInputRef.current.value ? parseFloat(this.feesInputRef.current.value.replace(",", ".")) : 0;
        inflow.description = this.descriptionInputRef.current.value || null;
        inflow.startDate = readDateTimeInput(this.startDateInputRef.current, false);
        inflow.endDate = readDateTimeInput(this.endDateInputRef.current, false);
        inflow.date = readDateTimeInput(this.dateInputRef.current);

        if (isNaN(inflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!inflow.date) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        if (create) {
            try {
                inflow.id = await createInflow({ ...inflow, person: inflow.person.id, fromBusiness: inflow.fromBusiness?.id ?? null });
            } catch (error) {
                if (error === "From name must be between 2 and 50 characters")
                    throw { info: <Info>Le nom de la source doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.fromNameInputRef.current.focus() };
                else if (error === "Description must be between 2 and 100 characters")
                    throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
                else if (error === "Start date and end date must be both set or both null")
                    throw { info: <Info>La date de début et la date de fin doivent être toutes les deux définies ou toutes les deux non définies !</Info>, cb: () => this.startDateInputRef.current.focus() };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return inflow;
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} names={this.props.names} />

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
            <input ref={this.amountInputRef} disabled={this.props.disabled} {...amountInputEvents}
                onKeyDown={(event) => event.key === "Enter" && this.feesInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Frais").join(" - ")}</div>
            <input ref={this.feesInputRef} disabled={this.props.disabled} {...amountInputEvents}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Description").join(" - ")}</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de début").join(" - ")}</div>
            <input ref={this.startDateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ time: false })}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de fin").join(" - ")}</div>
            <input ref={this.endDateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ time: false })}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ defaultValue: Date.now() })}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter && this.props.onEnter()} enterKeyHint="next" />

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
        outflow.toBusiness = this.state.toBusiness ? await this.toBusinessFormRef.current.choose(create) : null;
        outflow.toName = !this.state.toBusiness ? this.toNameInputRef.current.value : null;
        outflow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        outflow.description = this.descriptionInputRef.current.value || null;
        outflow.startDate = readDateTimeInput(this.startDateInputRef.current, false);
        outflow.endDate = readDateTimeInput(this.endDateInputRef.current, false);
        outflow.date = readDateTimeInput(this.dateInputRef.current);

        if (isNaN(outflow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!outflow.date) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        if (create) {
            try {
                outflow.id = await createOutflow({ ...outflow, person: outflow.person.id, toBusiness: outflow.toBusiness?.id ?? null });
            } catch (error) {
                if (error === "To name must be between 2 and 50 characters")
                    throw { info: <Info>Le nom de la destination doit contenir entre 2 et 50 caractères !</Info>, cb: () => this.toNameInputRef.current.focus() };
                else if (error === "Description must be between 2 and 100 characters")
                    throw { info: <Info>La description doit contenir entre 2 et 100 caractères !</Info>, cb: () => this.descriptionInputRef.current.focus() };
                else if (error === "Start date and end date must be both set or both null")
                    throw { info: <Info>La date de début et la date de fin doivent être toutes les deux définies ou toutes les deux non définies !</Info>, cb: () => this.startDateInputRef.current.focus() };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return outflow;
    }

    render() {
        return <>

            <ChoosePersonForm ref={this.personFormRef} disabled={this.props.disabled} names={this.props.names} />

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
            <input ref={this.amountInputRef} disabled={this.props.disabled} {...amountInputEvents}
                onKeyDown={(event) => event.key === "Enter" && this.descriptionInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Description").join(" - ")}</div>
            <input ref={this.descriptionInputRef} disabled={this.props.disabled}
                onKeyDown={(event) => event.key === "Enter" && this.startDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de début").join(" - ")}</div>
            <input ref={this.startDateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ time: false })}
                onKeyDown={(event) => event.key === "Enter" && this.endDateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date de fin").join(" - ")}</div>
            <input ref={this.endDateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ time: false })}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ defaultValue: Date.now() })}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter && this.props.onEnter()} enterKeyHint="next" />

        </>;
    }
}

export const ChooseInflowForm = (props) => <ChooseForm name="Entrée" getOptions={() => getInflows(["person", "fromBusiness"])} getForm={(props) => <CreateInflowForm {...props} />} {...props}
    getName={(inflow) => `${inflow.fromName ?? inflow.fromBusiness.name} -> ${inflow.person.name} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(inflow.amount)}`} />;

export const ChooseOutflowForm = (props) => <ChooseForm name="Sortie" getOptions={() => getOutflows(["person", "toBusiness"])} getForm={(props) => <CreateOutflowForm {...props} />} {...props}
    getName={(outflow) => `${outflow.person.name} -> ${outflow.toName ?? outflow.toBusiness.name} - ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(outflow.amount)}`} />;

export class CreateFlowForm extends Component {

    constructor(props) {

        super(props);

        this.fromAccountFormRef = createRef();
        this.toAccountFormRef = createRef();
        this.amountInputRef = createRef();
        this.dateInputRef = createRef();

        this.state = { fromAccount: true, toAccount: false };
    }

    async create(create = true) {

        const flow = {};
        flow.fromAccount = this.state.fromAccount ? await this.fromAccountFormRef.current.choose(create) : null;
        flow.toAccount = this.state.toAccount ? await this.toAccountFormRef.current.choose(create) : null;
        flow.amount = parseFloat(this.amountInputRef.current.value.replace(",", "."));
        flow.date = readDateTimeInput(this.dateInputRef.current);

        if (isNaN(flow.amount)) throw { info: <Info>Le montant doit être un nombre !</Info>, cb: () => this.amountInputRef.current.focus() };
        if (!flow.date) throw { info: <Info>Veuillez choisir une date valide !</Info>, cb: () => this.dateInputRef.current.focus() };

        if (create) {
            try {
                flow.id = await createFlow({ ...flow, fromAccount: flow.fromAccount?.id ?? null, toAccount: flow.toAccount?.id ?? null });
            } catch (error) {
                if (error === "From account and to account cannot be the same")
                    throw { info: <Info>Les comptes source et destination doivent être différents !</Info> };
                else
                    throw { info: <Info>Un problème est survenu !</Info> };
            }
        }

        return flow;
    }

    render() {
        return <>

            <div>{(this.props.names ?? []).concat("Source").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.fromAccount ? "" : "selected"} onClick={() => this.setState({ fromAccount: false, toAccount: true })}>Entrées</button>
                <button disabled={this.props.disabled} className={this.state.fromAccount ? "selected" : ""} onClick={() => this.setState({ fromAccount: true })}>Compte</button>
            </div>

            {this.state.fromAccount && <ChooseAccountForm ref={this.fromAccountFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Source")}
                onEnter={() => !this.state.toAccount && this.amountInputRef.current.focus()} />}

            <div>{(this.props.names ?? []).concat("Destination").join(" - ")}</div>
            <div className="choose-list-horizontal">
                <button disabled={this.props.disabled} className={this.state.toAccount ? "" : "selected"} onClick={() => this.setState({ toAccount: false, fromAccount: true })}>Sorties</button>
                <button disabled={this.props.disabled} className={this.state.toAccount ? "selected" : ""} onClick={() => this.setState({ toAccount: true })}>Compte</button>
            </div>

            {this.state.toAccount && <ChooseAccountForm ref={this.toAccountFormRef} disabled={this.props.disabled} names={(this.props.names ?? []).concat("Destination")}
                onEnter={() => this.amountInputRef.current.focus()} />}

            <div>{(this.props.names ?? []).concat("Montant").join(" - ")}</div>
            <input ref={this.amountInputRef} disabled={this.props.disabled} {...amountInputEvents}
                onKeyDown={(event) => event.key === "Enter" && this.dateInputRef.current.focus()} />

            <div>{(this.props.names ?? []).concat("Date").join(" - ")}</div>
            <input ref={this.dateInputRef} disabled={this.props.disabled} {...dateTimeInputEvents({ defaultValue: Date.now() })}
                onKeyDown={(event) => event.key === "Enter" && this.props.onEnter && this.props.onEnter()} enterKeyHint="next" />
        </>;
    }
}

export const amountInputEvents = {
    onInput: (event) => event.target.value = event.target.value.replace(/[^\d.,]/g, "").replace(/\./g, ",").replace(/^([^.]*,)|,/g, "$1"),
    onBlur: (event) => { const parsed = parseFloat(event.target.value.replace(",", ".")); event.target.value = isNaN(parsed) ? "" : parsed.toFixed(2).replace(".", ",") },
    inputMode: "numeric"
};

const dateTimeInputEvents = (options = {}) => {
    if (typeof options.time === "undefined") options.time = true;

    const template = options.time ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";
    const numTemplate = template.replace(/[^/ :]/g, "0");

    return {
        onFocus: (event) => event.target.setSelectionRange(0, 0),
        onInput: (event) => {
            let value = event.target.value;
            let cursor = event.target.selectionStart;

            if (value.length === template.length - 1) { // Backspace pressed
                value = value.slice(0, cursor) + numTemplate.charAt(cursor) + value.slice(cursor); // Repair text
                if (["/", " ", ":"].includes(value[cursor])) {
                    value = value.slice(0, cursor - 1) + "0" + value.slice(cursor);
                    cursor--;
                }
            }

            const split = value.replace(/[^0-9\/ :]/g, "").split(/[\/ :]/g);
            const get = (i, length = 2) => parseInt(split[i]?.slice(0, length) || "0").toString().padStart(length, "0");
            value = options.time ? `${get(0)}/${get(1)}/${get(2, 4)} ${get(3)}:${get(4)}` : `${get(0)}/${get(1)}/${get(2, 4)}`;
            if (["/", " ", ":"].includes(value[cursor])) cursor++;

            event.target.value = value;
            event.target.setSelectionRange(cursor, cursor);
        },
        defaultValue: options.defaultValue ? moment(options.defaultValue).format(template) : numTemplate,
        inputMode: "numeric"
    };
};

const readDateTimeInput = (input, time = true) => {
    const template = time ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";
    const numTemplate = template.replace(/[^/ :]/g, "0");
    return input.value !== numTemplate ? moment(input.value, template).toDate().getTime() : null;
};
