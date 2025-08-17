/**
 * @author @Takenoko-II
 * @copyright 2024/06/23
 */
import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData, FormCancelationReason } from "@minecraft/server-ui";
import { sentry } from "./TypeSentry";
const numberRangeType = sentry.objectOf({
    min: sentry.number,
    max: sentry.number
});
const dropdownOptionType = sentry.objectOf({
    id: sentry.string,
    text: sentry.unionOf(sentry.string, sentry.objectOf({}))
});
/**
 * このライブラリが投げる例外のクラス
 */
export class ServerFormError extends TypeError {
    cause;
    constructor(cause) {
        super("Unhandled Promise Rejection: " + cause.message);
        this.cause = cause;
    }
}
/**
 * フォームが閉じられる要因
 */
export var ServerFormCancelationCause;
(function (ServerFormCancelationCause) {
    /**
     * `UserBusy`, `UserClosed`のどちらも含む
     */
    ServerFormCancelationCause["Any"] = "Any";
    /**
     * プレイヤーがフォームを開くことができる状況下にないとき
     */
    ServerFormCancelationCause["UserBusy"] = "UserBusy";
    /**
     * プレイヤー自身がフォームを閉じたとき
     */
    ServerFormCancelationCause["UserClosed"] = "UserClosed";
})(ServerFormCancelationCause || (ServerFormCancelationCause = {}));
/**
 * フォームの要素の型を絞り込むための関数の集合
 */
export class ServerFormElementPredicates {
    /**
     * @param value
     * @returns `value`が`ActionButton`であれば真
     */
    static isActionButton(value) {
        return sentry.objectOf({
            name: sentry.unionOf(sentry.string, sentry.objectOf({})),
            iconPath: sentry.optionalOf(sentry.string),
            callbacks: sentry.setOf(sentry.function),
            tags: sentry.arrayOf(sentry.string),
            type: sentry.string
        }).test(value) && value.type === ElementType.ACTION_BUTTON;
    }
    /**
     * @param value
     * @returns `value`が`ModalFormElement`であれば真
     */
    static isModalFormElement(value) {
        return sentry.objectOf({
            id: sentry.string,
            label: sentry.unionOf(sentry.string, sentry.objectOf({})),
            type: sentry.string
        }).test(value) && value.type === ElementType.MODAL_FORM_ELEMENT;
    }
    /**
     * @param value
     * @returns `value`が`ModalFormToggle`であれば真
     */
    static isToggle(value) {
        return ServerFormElementPredicates.isModalFormElement(value)
            && sentry.objectOf({
                defaultValue: sentry.boolean
            }).test(value);
    }
    /**
     * @param value
     * @returns `value`が`ModalFormSlider`であれば真
     */
    static isSlider(value) {
        return ServerFormElementPredicates.isModalFormElement(value)
            && sentry.objectOf({
                range: numberRangeType,
                step: sentry.number,
                defaultValue: sentry.number
            }).test(value);
    }
    /**
     * @param value
     * @returns `value`が`ModalFormDropdown`であれば真
     */
    static isDropdown(value) {
        return ServerFormElementPredicates.isModalFormElement(value)
            && sentry.objectOf({
                list: sentry.arrayOf(dropdownOptionType),
                defaultValueIndex: sentry.int
            }).test(value);
    }
    /**
     * @param value
     * @returns `value`が`ModalFormTextField`であれば真
     */
    static isTextField(value) {
        return ServerFormElementPredicates.isModalFormElement(value)
            && sentry.objectOf({
                placeHolder: sentry.unionOf(sentry.string, sentry.objectOf({})),
                defaultValue: sentry.string
            }).test(value);
    }
    /**
     * @param value
     * @returns `value`が`MessageButton`であれば真
     */
    static isMessageButton(value) {
        return sentry.objectOf({
            name: sentry.unionOf(sentry.string, sentry.objectOf({})),
            callbacks: sentry.setOf(sentry.function),
            type: sentry.string
        }).test(value) && value.type === ElementType.MESSAGE_BUTTON;
    }
    /**
     * @param value
     * @returns `value`が`Decoration`であれば真
     */
    static isDecoration(value) {
        return sentry.objectOf({
            id: sentry.string
        }).test(value);
    }
    /**
     * @param value
     * @returns `value`が`Label`であれば真
     */
    static isLabel(value) {
        return this.isDecoration(value)
            && value.type === "LABEL";
    }
    /**
     * @param value
     * @returns `value`が`Header`であれば真
     */
    static isHeader(value) {
        return this.isDecoration(value)
            && value.type === "HEADER";
    }
    /**
     * @param value
     * @returns `value`が`Divider`であれば真
     */
    static isDivider(value) {
        return this.isDecoration(value)
            && value.type === "DIVIDER";
    }
}
/**
 * フォームを作成するためのクラスが継承するクラス
 */
export class ServerFormWrapper {
    titleText = "";
    cancelationCallbacks = new Map([
        [ServerFormCancelationCause.Any, new Set()],
        [ServerFormCancelationCause.UserBusy, new Set()],
        [ServerFormCancelationCause.UserClosed, new Set()]
    ]);
    errorCatcherCallbacks = new Set();
    /**
     * `ServerFormWrapper`のインスタンスを生成します。
     */
    constructor() { }
    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     * @returns `this`
     */
    title(text) {
        this.titleText = text;
        return this;
    }
    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onCancel(value, callbackFn) {
        this.cancelationCallbacks.get(value).add(callbackFn);
        return this;
    }
    /**
     * フォームが例外を捕捉した際に呼び出されるコールバック関数を登録します。
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onCatch(callbackFn) {
        this.errorCatcherCallbacks.add(callbackFn);
        return this;
    }
}
export var ElementType;
(function (ElementType) {
    ElementType["LABEL"] = "LABEL";
    ElementType["HEADER"] = "HEADER";
    ElementType["DIVIDER"] = "DIVIDER";
    ElementType["ACTION_BUTTON"] = "ACTION_BUTTON";
    ElementType["MESSAGE_BUTTON"] = "MESSAGE_BUTTON";
    ElementType["MODAL_FORM_ELEMENT"] = "MODAL_FORM_ELEMENT";
})(ElementType || (ElementType = {}));
/**
 * `ActionFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class ActionFormWrapper extends ServerFormWrapper {
    bodyText = undefined;
    values = [];
    pushEventCallbacks = new Set();
    /**
     * `ActionFormWrapper`のインスタンスを生成します。
     */
    constructor() {
        super();
        this.elements = undefined;
        Object.defineProperty(this, "elements", {
            get: () => {
                const that = this;
                return {
                    getButtonByPredicate(predicate) {
                        return that.values
                            .filter(ServerFormElementPredicates.isActionButton)
                            .filter(predicate);
                    },
                    getLabel(id) {
                        return that.values.filter(ServerFormElementPredicates.isLabel)
                            .find(label => label.id === id);
                    },
                    getHeader(id) {
                        return that.values.filter(ServerFormElementPredicates.isHeader)
                            .find(header => header.id === id);
                    },
                    getDivider(id) {
                        return that.values.filter(ServerFormElementPredicates.isDivider)
                            .find(divider => divider.id === id);
                    },
                    getAll() {
                        return that.values;
                    },
                };
            }
        });
    }
    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    body(...texts) {
        this.bodyText = {
            rawtext: texts.map((_, i) => {
                const rawMessage = (typeof _ === "string") ? { text: _ } : _;
                if (i < texts.length - 1)
                    return {
                        rawtext: [
                            rawMessage,
                            { text: "\n" }
                        ]
                    };
                else
                    return rawMessage;
            })
        };
        return this;
    }
    /**
     * フォームにボタンを追加します。
     * @param button ボタン
     * @overload
     */
    button(button) {
        this.values.push({
            name: button.name,
            iconPath: button.iconPath,
            tags: button.tags ?? [],
            callbacks: new Set(button.on ? [button.on] : undefined),
            type: "ACTION_BUTTON"
        });
        return this;
    }
    label(label) {
        this.values.push({
            id: label.id,
            text: label.text,
            type: "LABEL"
        });
        return this;
    }
    header(header) {
        this.values.push({
            id: header.id,
            text: header.text,
            type: "HEADER"
        });
        return this;
    }
    divider(divider) {
        this.values.push({
            id: divider.id,
            type: "DIVIDER"
        });
        return this;
    }
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     */
    onPush(predicate, callbackFn) {
        this.pushEventCallbacks.add(event => {
            if (predicate(event.button)) {
                callbackFn(event);
            }
        });
        return this;
    }
    /**
     * フォームの要素の定義情報
     */
    elements;
    open(player) {
        const form = new ActionFormData()
            .title(this.titleText);
        if (this.bodyText !== undefined) {
            form.body(this.bodyText);
        }
        for (const value of this.values) {
            if (ServerFormElementPredicates.isActionButton(value)) {
                form.button(value.name, value.iconPath);
            }
            else if (ServerFormElementPredicates.isLabel(value)) {
                form.label(value.text);
            }
            else if (ServerFormElementPredicates.isHeader(value)) {
                form.header(value.text);
            }
            else if (ServerFormElementPredicates.isDivider(value)) {
                form.divider();
            }
            else {
                throw new ServerFormError(new Error("無効な要素の型です: " + JSON.stringify(value)));
            }
        }
        // @ts-ignore "@minecraft/server"のPlayerと"@minecraft/server-ui"のPlayerが一致しないんだよねなんか
        const promise = form.show(player).then(response => {
            if (response.selection === undefined) {
                const that = this;
                const cancelEvent = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };
                this.cancelationCallbacks.get("Any").forEach(callbackFn => {
                    callbackFn(cancelEvent);
                });
                if (response.cancelationReason === "UserBusy") {
                    this.cancelationCallbacks.get("UserBusy").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.cancelationCallbacks.get("UserClosed").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                return;
            }
            const button = this.values.filter(ServerFormElementPredicates.isActionButton)[response.selection];
            if (button.callbacks.size > 0) {
                button.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
            }
            this.pushEventCallbacks.forEach(callbackFn => {
                callbackFn({ button, player });
            });
        });
        if (this.errorCatcherCallbacks.size > 0) {
            promise.catch(error => {
                this.errorCatcherCallbacks.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }
}
/**
 * `ModalFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class ModalFormWrapper extends ServerFormWrapper {
    values = [];
    submitButtonInfo = {
        name: { translate: "gui.submit" },
        on() { }
    };
    /**
     * `ModalFormWrapper`のインスタンスを生成します。
     */
    constructor() {
        super();
        this.elements = undefined;
        Object.defineProperty(this, "elements", {
            get: () => {
                const that = this;
                function getElement(id) {
                    return that.values
                        .filter(ServerFormElementPredicates.isModalFormElement)
                        .find(value => value.id === id);
                }
                return {
                    getToggle(id) {
                        const element = getElement(id);
                        return (ServerFormElementPredicates.isToggle(element)) ? element : undefined;
                    },
                    getSlider(id) {
                        const element = getElement(id);
                        return (ServerFormElementPredicates.isSlider(element)) ? element : undefined;
                    },
                    getTextField(id) {
                        const element = getElement(id);
                        return (ServerFormElementPredicates.isTextField(element)) ? element : undefined;
                    },
                    getDropdown(id) {
                        const element = getElement(id);
                        return (ServerFormElementPredicates.isDropdown(element)) ? element : undefined;
                    },
                    getSubmitButton() {
                        return that.submitButtonInfo;
                    },
                    getModalFormElementByPredicate(predicate) {
                        const vals = [];
                        for (const val of that.values.filter(ServerFormElementPredicates.isModalFormElement)) {
                            const v = val;
                            if (predicate(v)) {
                                vals.push(v);
                            }
                        }
                        return vals;
                    },
                    getLabel(id) {
                        return that.values
                            .filter(ServerFormElementPredicates.isLabel)
                            .find(label => label.id === id);
                    },
                    getHeader(id) {
                        return that.values
                            .filter(ServerFormElementPredicates.isHeader)
                            .find(header => header.id === id);
                    },
                    getDivider(id) {
                        return that.values
                            .filter(ServerFormElementPredicates.isDivider)
                            .find(divider => divider.id === id);
                    },
                    getAll() {
                        return that.values;
                    }
                };
            }
        });
    }
    /**
     * フォームにトグルを追加します。
     * @param toggle トグル
     * @overload
     */
    toggle(toggle) {
        this.values.push({
            id: toggle.id,
            label: toggle.label,
            defaultValue: toggle.defaultValue ?? false,
            type: "MODAL_FORM_ELEMENT"
        });
        return this;
    }
    /**
     * フォームにスライダーを追加します。
     * @param slider スライダー
     * @overload
     */
    slider(slider) {
        this.values.push({
            id: slider.id,
            label: slider.label,
            step: slider.step ?? 1,
            range: slider.range,
            defaultValue: slider.defaultValue ?? 0,
            type: "MODAL_FORM_ELEMENT"
        });
        return this;
    }
    /**
     * フォームにドロップダウンを追加します。
     * @param dropdown ドロップダウン
     * @overload
     */
    dropdown(dropdown) {
        this.values.push({
            id: dropdown.id,
            label: dropdown.label,
            list: dropdown.list,
            defaultValueIndex: dropdown.defaultValueIndex ?? 0,
            type: "MODAL_FORM_ELEMENT"
        });
        return this;
    }
    /**
     * フォームにテキストフィールドを追加します。
     * @param textField テキストフィールド
     * @overload
     */
    textField(textField) {
        this.values.push({
            id: textField.id,
            label: textField.label,
            placeHolder: textField.placeHolder,
            defaultValue: textField.defaultValue ?? "",
            type: "MODAL_FORM_ELEMENT"
        });
        return this;
    }
    /**
     * 送信ボタンの設定を行います。
     * @param button 送信ボタン
     */
    submitButton(button) {
        this.submitButtonInfo = {
            name: button.name,
            on: button.on ?? (() => { })
        };
        return this;
    }
    label(label) {
        this.values.push({
            id: label.id,
            text: label.text,
            type: "LABEL"
        });
        return this;
    }
    header(header) {
        this.values.push({
            id: header.id,
            text: header.text,
            type: "HEADER"
        });
        return this;
    }
    divider(divider) {
        this.values.push({
            id: divider.id,
            type: "DIVIDER"
        });
        return this;
    }
    /**
     * フォームの要素の定義情報
     */
    elements;
    open(player) {
        const form = new ModalFormData()
            .title(this.titleText)
            .submitButton(this.submitButtonInfo.name);
        for (const value of this.values) {
            if (ServerFormElementPredicates.isToggle(value)) {
                form.toggle(value.label, { defaultValue: value.defaultValue });
            }
            else if (ServerFormElementPredicates.isSlider(value)) {
                form.slider(value.label, value.range.min, value.range.max, { valueStep: value.step, defaultValue: value.defaultValue });
            }
            else if (ServerFormElementPredicates.isDropdown(value)) {
                form.dropdown(value.label, value.list.map(({ text }) => text), { defaultValueIndex: value.defaultValueIndex });
            }
            else if (ServerFormElementPredicates.isTextField(value)) {
                form.textField(value.label, value.placeHolder, { defaultValue: value.defaultValue });
            }
            else if (ServerFormElementPredicates.isLabel(value)) {
                form.label(value.text);
            }
            else if (ServerFormElementPredicates.isHeader(value)) {
                form.header(value.text);
            }
            else if (ServerFormElementPredicates.isDivider(value)) {
                form.divider();
            }
            else {
                throw new ServerFormError(new Error("無効なModalForm要素です"));
            }
        }
        // @ts-ignore "@minecraft/server"のPlayerと"@minecraft/server-ui"のPlayerが一致しないんだよねなんか
        const promise = form.show(player).then(response => {
            if (response.formValues === undefined) {
                const that = this;
                const cancelEvent = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };
                this.cancelationCallbacks.get("Any").forEach(callbackFn => {
                    callbackFn(cancelEvent);
                });
                if (response.cancelationReason === "UserBusy") {
                    this.cancelationCallbacks.get("UserBusy").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.cancelationCallbacks.get("UserClosed").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                return;
            }
            const that = this;
            const elements = that.values.filter(ServerFormElementPredicates.isModalFormElement);
            function getMatchingElementIndex(id, predicate) {
                const index = elements.findIndex(value => value.id === id);
                if (index === -1) {
                    throw new ServerFormError(new Error("指定されたIDの要素が見つかりませんでした"));
                }
                else if (predicate(elements[index]))
                    return index;
                else {
                    throw new ServerFormError(new Error("指定されたIDの要素の型が正しくありません: " + JSON.stringify(elements) + ", " + predicate.toString() + ", " + id + ", " + index));
                }
            }
            const inputValues = response.formValues.filter(x => x !== undefined);
            const submitEvent = {
                player,
                getToggleInput(id) {
                    const index = getMatchingElementIndex(id, ServerFormElementPredicates.isToggle);
                    return inputValues[index];
                },
                getSliderInput(id) {
                    const index = getMatchingElementIndex(id, ServerFormElementPredicates.isSlider);
                    return inputValues[index];
                },
                getDropdownInput(id) {
                    const index = getMatchingElementIndex(id, ServerFormElementPredicates.isDropdown);
                    const optionIndex = inputValues[index];
                    return {
                        index: optionIndex,
                        value: elements[index].list[optionIndex]
                    };
                },
                getTextFieldInput(id) {
                    const index = getMatchingElementIndex(id, ServerFormElementPredicates.isTextField);
                    return inputValues[index];
                },
                getAllInputs() {
                    return inputValues
                        .map((formValue, index) => {
                        const value = elements[index];
                        return ServerFormElementPredicates.isDropdown(value)
                            ? { index: formValue, value: value.list[formValue] }
                            : formValue;
                    })
                        .filter(x => x !== undefined);
                }
            };
            this.submitButtonInfo.on(submitEvent);
        });
        if (this.errorCatcherCallbacks.size > 0) {
            promise.catch(error => {
                this.errorCatcherCallbacks.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }
}
/**
 * `MessageFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export class MessageFormWrapper extends ServerFormWrapper {
    bodyText = undefined;
    buttonPair = [
        { name: "1", callbacks: new Set(), type: "MESSAGE_BUTTON" },
        { name: "2", callbacks: new Set(), type: "MESSAGE_BUTTON" }
    ];
    pushEventCallbacks = new Set();
    /**
     * `MessageFormWrapper`のインスタンスを生成します。
     */
    constructor() {
        super();
        this.elements = undefined;
        Object.defineProperty(this, "elements", {
            get: () => {
                const that = this;
                return {
                    getButtons() {
                        return that.buttonPair;
                    }
                };
            }
        });
    }
    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    body(...texts) {
        this.bodyText = {
            rawtext: texts.map((_, i) => {
                const rawMessage = (typeof _ === "string") ? { text: _ } : _;
                if (i < texts.length - 1)
                    return {
                        rawtext: [
                            rawMessage,
                            { text: "\n" }
                        ]
                    };
                else
                    return rawMessage;
            })
        };
        return this;
    }
    /**
     * フォームにボタン1を追加します。
     * @param button1 ボタン1
     */
    button1(button1) {
        this.buttonPair[0] = {
            name: button1.name,
            callbacks: new Set(button1.on ? [button1.on] : undefined),
            type: "MESSAGE_BUTTON"
        };
        return this;
    }
    /**
     * フォームにボタン2を追加します。
     * @param button2 ボタン2
     */
    button2(button2) {
        this.buttonPair[1] = {
            name: button2.name,
            callbacks: new Set(button2.on ? [button2.on] : undefined),
            type: "MESSAGE_BUTTON"
        };
        return this;
    }
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onPush(callbackFn) {
        this.pushEventCallbacks.add(callbackFn);
        return this;
    }
    /**
     * フォームのボタンの定義情報
     */
    elements;
    open(player) {
        if (this.bodyText === undefined) {
            throw new ServerFormError(new Error("bodyが設定されていません"));
        }
        const form = new MessageFormData()
            .title(this.titleText)
            .body(this.bodyText)
            .button1(this.buttonPair[0].name)
            .button2(this.buttonPair[1].name);
        // @ts-ignore "@minecraft/server"のPlayerと"@minecraft/server-ui"のPlayerが一致しないんだよねなんか
        const promise = form.show(player).then(response => {
            if (response.selection === undefined) {
                const that = this;
                const cancelEvent = {
                    player,
                    reason: response.cancelationReason,
                    reopen() {
                        system.run(() => {
                            that.open(player);
                        });
                    }
                };
                this.cancelationCallbacks.get("Any").forEach(callbackFn => {
                    callbackFn(cancelEvent);
                });
                if (response.cancelationReason === FormCancelationReason.UserBusy) {
                    this.cancelationCallbacks.get("UserBusy").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                else if (response.cancelationReason === FormCancelationReason.UserClosed) {
                    this.cancelationCallbacks.get("UserClosed").forEach(callbackFn => {
                        callbackFn(cancelEvent);
                    });
                }
                return;
            }
            if (response.selection === 0) {
                this.buttonPair[0].callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
                this.pushEventCallbacks.forEach(callbackFn => {
                    callbackFn({ button: { ...this.buttonPair[0] }, player });
                });
            }
            else {
                this.buttonPair[1].callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
                this.pushEventCallbacks.forEach(callbackFn => {
                    callbackFn({ button: { ...this.buttonPair[1] }, player });
                });
            }
        });
        if (this.errorCatcherCallbacks.size > 0) {
            promise.catch(error => {
                this.errorCatcherCallbacks.forEach(catcher => {
                    catcher({
                        player,
                        error: new ServerFormError(error)
                    });
                });
            });
        }
    }
}
