/**
 * @author @Takenoko-II
 * @copyright 2024/06/23
 */
import { NumberRange } from "@minecraft/common";
import { Player, RawMessage } from "@minecraft/server";
/**
 * このライブラリが投げる例外のクラス
 */
export declare class ServerFormError extends TypeError {
    readonly cause: Error;
    constructor(cause: Error);
}
/**
 * フォームが閉じられる要因
 */
export declare enum ServerFormCancelationCause {
    /**
     * `UserBusy`, `UserClosed`のどちらも含む
     */
    Any = "Any",
    /**
     * プレイヤーがフォームを開くことができる状況下にないとき
     */
    UserBusy = "UserBusy",
    /**
     * プレイヤー自身がフォームを閉じたとき
     */
    UserClosed = "UserClosed"
}
/**
 * フォームの要素の型を絞り込むための関数の集合
 */
export declare class ServerFormElementPredicates {
    /**
     * @param value
     * @returns `value`が`ActionButton`であれば真
     */
    static isActionButton(value: unknown): value is ActionButton;
    /**
     * @param value
     * @returns `value`が`ModalFormElement`であれば真
     */
    static isModalFormElement(value: unknown): value is ModalFormElement;
    /**
     * @param value
     * @returns `value`が`ModalFormToggle`であれば真
     */
    static isToggle(value: unknown): value is ModalFormToggle;
    /**
     * @param value
     * @returns `value`が`ModalFormSlider`であれば真
     */
    static isSlider(value: unknown): value is ModalFormSlider;
    /**
     * @param value
     * @returns `value`が`ModalFormDropdown`であれば真
     */
    static isDropdown(value: unknown): value is ModalFormDropdown;
    /**
     * @param value
     * @returns `value`が`ModalFormTextField`であれば真
     */
    static isTextField(value: unknown): value is ModalFormTextField;
    /**
     * @param value
     * @returns `value`が`MessageButton`であれば真
     */
    static isMessageButton(value: unknown): value is MessageButton;
    /**
     * @param value
     * @returns `value`が`Decoration`であれば真
     */
    static isDecoration(value: unknown): value is Decoration;
    /**
     * @param value
     * @returns `value`が`Label`であれば真
     */
    static isLabel(value: unknown): value is Label;
    /**
     * @param value
     * @returns `value`が`Header`であれば真
     */
    static isHeader(value: unknown): value is Header;
    /**
     * @param value
     * @returns `value`が`Divider`であれば真
     */
    static isDivider(value: unknown): value is Divider;
}
/**
 * フォームを作成するためのクラスが継承するクラス
 */
export declare abstract class ServerFormWrapper {
    protected titleText: string | RawMessage;
    protected readonly cancelationCallbacks: Map<keyof typeof ServerFormCancelationCause, Set<(event: ServerFormCancelEvent) => void>>;
    protected readonly errorCatcherCallbacks: Set<(event: ServerFormCatchErrorEvent) => void>;
    /**
     * `ServerFormWrapper`のインスタンスを生成します。
     */
    protected constructor();
    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     * @returns `this`
     */
    title(text: string | RawMessage): this;
    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onCancel(value: keyof typeof ServerFormCancelationCause, callbackFn: (event: ServerFormCancelEvent) => void): this;
    /**
     * フォームが例外を捕捉した際に呼び出されるコールバック関数を登録します。
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onCatch(callbackFn: (event: ServerFormCatchErrorEvent) => void): this;
    /**
     * フォームを表示します。
     * @param player プレイヤー
     */
    abstract open(player: Player): void;
}
export interface Decoratable {
    /**
     * フォームにラベルを追加します。
     */
    label(label: Label): Decoratable;
    /**
     * フォームにヘッダーを追加します。
     */
    header(header: Header): Decoratable;
    /**
     * フォームに区切りを追加します。
     */
    divider(divider: Divider): Decoratable;
}
export declare enum ElementType {
    LABEL = "LABEL",
    HEADER = "HEADER",
    DIVIDER = "DIVIDER",
    ACTION_BUTTON = "ACTION_BUTTON",
    MESSAGE_BUTTON = "MESSAGE_BUTTON",
    MODAL_FORM_ELEMENT = "MODAL_FORM_ELEMENT"
}
export interface Element {
    readonly type: keyof typeof ElementType;
}
export interface Decoration extends Element {
    readonly id: string;
}
export interface Label extends Decoration {
    text: string | RawMessage;
    readonly type: "LABEL";
}
export interface Header extends Decoration {
    text: string | RawMessage;
    readonly type: "HEADER";
}
export interface Divider extends Decoration {
    readonly type: "DIVIDER";
}
export interface DecorationInput {
    id: string;
}
export interface LabelInput extends DecorationInput {
    text: string | RawMessage;
}
export interface HeaderInput extends DecorationInput {
    text: string | RawMessage;
}
export interface DividerInput extends DecorationInput {
}
/**
 * Actionボタンが操作の主軸となるフォームのクラスが実装するインターフェース
 */
export interface ActionPushable {
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onPush(predicate: (button: ActionButton) => boolean, callbackFn: (player: ServerFormActionButtonPushEvent) => void): ActionPushable;
}
/**
 * 送信ボタンのあるフォームのクラスが実装するインターフェース
 */
export interface Submittable {
    /**
     * 送信ボタンの設定を行います。
     * @param button 送信ボタン
     */
    submitButton(button: SubmitButtonInput): Submittable;
}
/**
 * Messageボタンが操作の主軸となるフォームのクラスが実装するインターフェース
 */
export interface MessagePushable {
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     * @returns `this`
     */
    onPush(callbackFn: (player: ServerFormMessageButtonPushEvent) => void): MessagePushable;
}
/**
 * フォームが閉じられたときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormCancelEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;
    /**
     * 閉じた理由
     */
    readonly reason: keyof typeof ServerFormCancelationCause;
    /**
     * このフォームを再度開く
     */
    reopen(): void;
}
/**
 * フォームが例外を捕捉したときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormCatchErrorEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;
    /**
     * エラー
     */
    readonly error: ServerFormError;
}
/**
 * フォームのボタンが押されたときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormActionButtonPushEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;
    /**
     * ボタンの名前
     */
    readonly button: ActionButton;
}
/**
 * フォームが送信されたときに発火するイベントのコールバックに渡される引数
 */
export interface ModalFormSubmitEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;
    /**
     * 特定のIDのトグルを取得します。
     * @param id 要素のID
     */
    getToggleInput(id: string): boolean | undefined;
    /**
     * 特定のIDのスライダーを取得します。
     * @param id 要素のID
     */
    getSliderInput(id: string): number | undefined;
    /**
     * 特定のIDのドロップダウンを取得します。
     * @param id 要素のID
     */
    getDropdownInput(id: string): SelectedDropdownValue | undefined;
    /**
     * 特定のIDのテキストフィールドを取得します。
     * @param id 要素のID
     */
    getTextFieldInput(id: string): string | undefined;
    /**
     * 入力された値を順にすべて返します。
     */
    getAllInputs(): (string | number | boolean | SelectedDropdownValue)[];
}
/**
 * フォームのボタンが押されたときに発火するイベントのコールバックに渡される引数
 */
export interface ServerFormMessageButtonPushEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;
    /**
     * ボタンの名前
     */
    readonly button: MessageButton;
}
/**
 * ActionFormのボタンを表現する型
 */
export interface ActionButton extends Element {
    /**
     * ボタンの名前
     */
    name: string | RawMessage;
    /**
     * ボタンのアイコンのテクスチャパス
     */
    iconPath?: string;
    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    readonly callbacks: Set<(player: Player) => void>;
    /**
     * ボタンのタグ
     */
    readonly tags: string[];
    readonly type: "ACTION_BUTTON";
}
/**
 * ActionFormのボタン入力用の型
 */
export interface ActionButtonInput {
    /**
     * ボタンの名前
     */
    name: string | RawMessage;
    /**
     * ボタンのアイコンのテクスチャパス
     */
    iconPath?: string;
    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    on?(player: Player): void;
    /**
     * ボタンのタグ
     */
    tags?: string[];
}
/**
 * MessageFormのボタン入力用の型
 */
export interface MessageButton extends Element {
    /**
     * ボタンの名前
     */
    name: string | RawMessage;
    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    readonly callbacks: Set<(player: Player) => void>;
}
/**
 * MessageFormのボタン入力用の型
 */
export interface MessageButtonInput {
    /**
     * ボタンの名前
     */
    name: string | RawMessage;
    /**
     * ボタンを押したときに呼び出されるコールバック関数
     */
    on?(player: Player): void;
}
/**
 * ModalFormの要素を表現する型
 */
export interface ModalFormElement extends Element {
    /**
     * 要素のID
     */
    readonly id: string;
    /**
     * ラベル
     */
    label: string | RawMessage;
}
/**
 * トグルを表現する型
 */
export interface ModalFormToggle extends ModalFormElement {
    /**
     * デフォルト値
     */
    defaultValue: boolean;
}
/**
 * スライダーを表現する型
 */
export interface ModalFormSlider extends ModalFormElement {
    /**
     * スライダーの数値の範囲
     */
    readonly range: NumberRange;
    /**
     * スライダーの数値の間隔
     */
    step: number;
    /**
     * デフォルト値
     */
    defaultValue: number;
}
/**
 * テキストフィールドを表現する型
 */
export interface ModalFormTextField extends ModalFormElement {
    /**
     * テキストフィールドの入力欄が未入力状態のときに表示する文字列
     */
    placeHolder: string | RawMessage;
    /**
     * デフォルト値
     */
    defaultValue: string;
}
/**
 * ドロップダウンの選択肢
 */
export interface DropdownOption {
    readonly id: string;
    text: string | RawMessage;
}
/**
 * 選択されたドロップダウンの選択肢
 */
export interface SelectedDropdownValue {
    readonly index: number;
    readonly value: DropdownOption;
}
/**
 * ドロップダウンを表現する型
 */
export interface ModalFormDropdown extends ModalFormElement {
    /**
     * ドロップダウンのリスト
     */
    readonly list: DropdownOption[];
    /**
     * デフォルト値のインデックス
     */
    defaultValueIndex: number;
}
/**
 * ModalFormの要素入力用の型
 */
export interface ModalFormElementInput {
    /**
     * 要素のID
     */
    id: string;
    /**
     * ラベル
     */
    label: string | RawMessage;
}
/**
 * トグルの入力用の型
 */
export interface ModalFormToggleInput extends ModalFormElementInput {
    /**
     * デフォルト値
     */
    defaultValue?: boolean;
}
/**
 * スライダーの入力用の型
 */
export interface ModalFormSliderInput extends ModalFormElementInput {
    /**
     * スライダーの数値の範囲
     */
    range: NumberRange;
    /**
     * スライダーの数値の間隔
     */
    step?: number;
    /**
     * デフォルト値
     */
    defaultValue?: number;
}
/**
 * テキストフィールドの入力用の型
 */
export interface ModalFormTextFieldInput extends ModalFormElementInput {
    /**
     * テキストフィールドの入力欄が未入力状態のときに表示する文字列
     */
    placeHolder: string | RawMessage;
    /**
     * デフォルト値
     */
    defaultValue?: string;
}
/**
 * ドロップダウンの入力用の型
 */
export interface ModalFormDropdownInput extends ModalFormElementInput {
    /**
     * ドロップダウンのリスト
     */
    list: DropdownOption[];
    /**
     * デフォルト値のインデックス
     */
    defaultValueIndex?: number;
}
export interface SubmitButton {
    name: string | RawMessage;
    on(event: ModalFormSubmitEvent): void;
}
/**
 * 送信ボタンの入力用の型
 */
export interface SubmitButtonInput {
    name: string | RawMessage;
    on?(event: ModalFormSubmitEvent): void;
}
export interface Definitions {
}
export interface DecorationDefinitions extends Definitions {
    /**
     * 特定のIDのラベルを取得します。
     */
    getLabel(id: string): Label | undefined;
    /**
     * 特定のIDのヘッダーを取得します。
     */
    getHeader(id: string): Header | undefined;
    /**
     * 特定のIDの区切りを取得します。
     */
    getDivider(id: string): Divider | undefined;
}
/**
 * ActionFormの要素の定義情報
 */
export interface ActionFormElementDefinitions extends DecorationDefinitions {
    /**
     * 条件に一致するボタンを取得します。
     * @param predicate ボタンの条件
     */
    getButtonByPredicate(predicate: (button: ActionButton) => boolean): ActionButton[];
    /**
     * 全ての要素を含む配列を取得します。
     */
    getAll(): (ActionButton | Header | Label | Divider)[];
}
/**
 * ModalFormの要素の定義情報
 */
export interface ModalFormElementDefinitions extends DecorationDefinitions {
    /**
     * 特定のIDのトグルを取得します。
     * @param id 要素のID
     */
    getToggle(id: string): ModalFormToggle | undefined;
    /**
     * 特定のIDのスライダーを取得します。
     * @param id 要素のID
     */
    getSlider(id: string): ModalFormSlider | undefined;
    /**
     * 特定のIDのドロップダウンを取得します。
     * @param id 要素のID
     */
    getDropdown(id: string): ModalFormDropdown | undefined;
    /**
     * 特定のIDのテキストフィールドを取得します。
     * @param id 要素のID
     */
    getTextField(id: string): ModalFormTextField | undefined;
    /**
     * 送信ボタンを取得します。
     */
    getSubmitButton(): SubmitButton;
    /**
     * 条件に一致する要素を取得します。
     * @param predicate 要素の条件
     */
    getModalFormElementByPredicate<T extends ModalFormElement>(predicate: (element: ModalFormElement) => element is T): T[];
    /**
     * 全ての要素を含む配列を取得します。
     */
    getAll(): (ModalFormToggle | ModalFormSlider | ModalFormDropdown | ModalFormTextField | Header | Label | Divider)[];
}
/**
 * ボタンの定義情報
 */
export interface MessageFormElementDefinitions extends Definitions {
    /**
     * 二つのボタンを取得します。
     */
    getButtons(): [MessageButton, MessageButton];
}
export interface DefinitionEnumerable<T extends Definitions> {
    readonly elements: T;
}
/**
 * `ActionFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export declare class ActionFormWrapper extends ServerFormWrapper implements ActionPushable, Decoratable, DefinitionEnumerable<ActionFormElementDefinitions> {
    private bodyText;
    private readonly values;
    private readonly pushEventCallbacks;
    /**
     * `ActionFormWrapper`のインスタンスを生成します。
     */
    constructor();
    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    body(...texts: (string | RawMessage)[]): this;
    /**
     * フォームにボタンを追加します。
     * @param button ボタン
     * @overload
     */
    button(button: ActionButtonInput): this;
    label(label: LabelInput): this;
    header(header: HeaderInput): this;
    divider(divider: DividerInput): this;
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param predicate ボタンの条件
     * @param callbackFn コールバック関数
     */
    onPush(predicate: (button: ActionButton) => boolean, callbackFn: (event: ServerFormActionButtonPushEvent) => void): this;
    /**
     * フォームの要素の定義情報
     */
    readonly elements: ActionFormElementDefinitions;
    open(player: Player): void;
}
/**
 * `ModalFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export declare class ModalFormWrapper extends ServerFormWrapper implements Submittable, Decoratable, DefinitionEnumerable<ModalFormElementDefinitions> {
    private readonly values;
    private submitButtonInfo;
    /**
     * `ModalFormWrapper`のインスタンスを生成します。
     */
    constructor();
    /**
     * フォームにトグルを追加します。
     * @param toggle トグル
     * @overload
     */
    toggle(toggle: ModalFormToggleInput): this;
    /**
     * フォームにスライダーを追加します。
     * @param slider スライダー
     * @overload
     */
    slider(slider: ModalFormSliderInput): this;
    /**
     * フォームにドロップダウンを追加します。
     * @param dropdown ドロップダウン
     * @overload
     */
    dropdown(dropdown: ModalFormDropdownInput): this;
    /**
     * フォームにテキストフィールドを追加します。
     * @param textField テキストフィールド
     * @overload
     */
    textField(textField: ModalFormTextFieldInput): this;
    /**
     * 送信ボタンの設定を行います。
     * @param button 送信ボタン
     */
    submitButton(button: SubmitButtonInput): this;
    label(label: LabelInput): this;
    header(header: HeaderInput): this;
    divider(divider: DividerInput): this;
    /**
     * フォームの要素の定義情報
     */
    readonly elements: ModalFormElementDefinitions;
    open(player: Player): void;
}
/**
 * `MessageFormData`をより直感的かつ簡潔に扱うことを目的としたクラス
 */
export declare class MessageFormWrapper extends ServerFormWrapper implements MessagePushable, DefinitionEnumerable<MessageFormElementDefinitions> {
    private bodyText;
    private readonly buttonPair;
    private readonly pushEventCallbacks;
    /**
     * `MessageFormWrapper`のインスタンスを生成します。
     */
    constructor();
    /**
     * フォームの本文を変更します。
     * @param texts 本文
     */
    body(...texts: (string | RawMessage)[]): this;
    /**
     * フォームにボタン1を追加します。
     * @param button1 ボタン1
     */
    button1(button1: MessageButtonInput): this;
    /**
     * フォームにボタン2を追加します。
     * @param button2 ボタン2
     */
    button2(button2: MessageButtonInput): this;
    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onPush(callbackFn: (event: ServerFormMessageButtonPushEvent) => void): this;
    /**
     * フォームのボタンの定義情報
     */
    readonly elements: MessageFormElementDefinitions;
    open(player: Player): void;
}
