// tslint:disable
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string | number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Adjustment = {
  __typename?: 'Adjustment';
  adjustmentSource: Scalars['String'];
  amount: Scalars['Int'];
  description: Scalars['String'];
  type: AdjustmentType;
};

export enum AdjustmentType {
  DISTRIBUTED_ORDER_PROMOTION = 'DISTRIBUTED_ORDER_PROMOTION',
  OTHER = 'OTHER',
  PROMOTION = 'PROMOTION'
}

export type AlreadyLoggedInError = ErrorResult & {
  __typename?: 'AlreadyLoggedInError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type Asset = Node & {
  __typename?: 'Asset';
  createdAt: Scalars['DateTime'];
  fileSize: Scalars['Int'];
  focalPoint?: Maybe<Coordinate>;
  height: Scalars['Int'];
  id: Scalars['ID'];
  mimeType: Scalars['String'];
  name: Scalars['String'];
  preview: Scalars['String'];
  source: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  type: AssetType;
  updatedAt: Scalars['DateTime'];
  width: Scalars['Int'];
};

export type AssetList = PaginatedList & {
  __typename?: 'AssetList';
  items: Array<Asset>;
  totalItems: Scalars['Int'];
};

export enum AssetType {
  BINARY = 'BINARY',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export type AuthenticationInput = {
  native?: InputMaybe<NativeAuthInput>;
};

export type AuthenticationMethod = Node & {
  __typename?: 'AuthenticationMethod';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  strategy: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type BooleanOperators = {
  eq?: InputMaybe<Scalars['Boolean']>;
};

/** 评论状态 */
export enum CommentState {
  /** 已批准 */
  APPROVED = 'APPROVED',
  /** 审核中, 比如审核通 */
  PENDING = 'PENDING',
  /** 垃圾评论 */
  SPAM = 'SPAM',
  /** 已删除 */
  TRASH = 'TRASH'
}

export type ConfigArg = {
  __typename?: 'ConfigArg';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type ConfigArgDefinition = {
  __typename?: 'ConfigArgDefinition';
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  list: Scalars['Boolean'];
  name: Scalars['String'];
  required: Scalars['Boolean'];
  type: Scalars['String'];
  ui?: Maybe<Scalars['JSON']>;
};

export type ConfigArgInput = {
  name: Scalars['String'];
  /** 实际值的JSON字符串化表示 */
  value: Scalars['String'];
};

export type ConfigurableOperation = {
  __typename?: 'ConfigurableOperation';
  args: Array<ConfigArg>;
  code: Scalars['String'];
};

export type ConfigurableOperationDefinition = {
  __typename?: 'ConfigurableOperationDefinition';
  args: Array<ConfigArgDefinition>;
  code: Scalars['String'];
  description: Scalars['String'];
};

export type ConfigurableOperationInput = {
  arguments: Array<ConfigArgInput>;
  code: Scalars['String'];
};

/** 内容格式类型 */
export type ContentParser = {
  __typename?: 'ContentParser';
  type?: Maybe<ContentParserType>;
};

export enum ContentParserType {
  BLOCK = 'BLOCK',
  JSON = 'JSON',
  MARKDOWN = 'MARKDOWN',
  RICH_TEXT = 'RICH_TEXT'
}

export type Coordinate = {
  __typename?: 'Coordinate';
  x: Scalars['Float'];
  y: Scalars['Float'];
};

/**
 * @description
 * ISO 4217 currency code
 *
 * @docsCategory common
 */
export enum CurrencyCode {
  /** United Arab Emirates dirham */
  AED = 'AED',
  /** Afghan afghani */
  AFN = 'AFN',
  /** Albanian lek */
  ALL = 'ALL',
  /** Armenian dram */
  AMD = 'AMD',
  /** Netherlands Antillean guilder */
  ANG = 'ANG',
  /** Angolan kwanza */
  AOA = 'AOA',
  /** Argentine peso */
  ARS = 'ARS',
  /** Australian dollar */
  AUD = 'AUD',
  /** Aruban florin */
  AWG = 'AWG',
  /** Azerbaijani manat */
  AZN = 'AZN',
  /** Bosnia and Herzegovina convertible mark */
  BAM = 'BAM',
  /** Barbados dollar */
  BBD = 'BBD',
  /** Bangladeshi taka */
  BDT = 'BDT',
  /** Bulgarian lev */
  BGN = 'BGN',
  /** Bahraini dinar */
  BHD = 'BHD',
  /** Burundian franc */
  BIF = 'BIF',
  /** Bermudian dollar */
  BMD = 'BMD',
  /** Brunei dollar */
  BND = 'BND',
  /** Boliviano */
  BOB = 'BOB',
  /** Brazilian real */
  BRL = 'BRL',
  /** Bahamian dollar */
  BSD = 'BSD',
  /** Bhutanese ngultrum */
  BTN = 'BTN',
  /** Botswana pula */
  BWP = 'BWP',
  /** Belarusian ruble */
  BYN = 'BYN',
  /** Belize dollar */
  BZD = 'BZD',
  /** Canadian dollar */
  CAD = 'CAD',
  /** Congolese franc */
  CDF = 'CDF',
  /** Swiss franc */
  CHF = 'CHF',
  /** Chilean peso */
  CLP = 'CLP',
  /** Renminbi (Chinese) yuan */
  CNY = 'CNY',
  /** Colombian peso */
  COP = 'COP',
  /** Costa Rican colon */
  CRC = 'CRC',
  /** Cuban convertible peso */
  CUC = 'CUC',
  /** Cuban peso */
  CUP = 'CUP',
  /** Cape Verde escudo */
  CVE = 'CVE',
  /** Czech koruna */
  CZK = 'CZK',
  /** Djiboutian franc */
  DJF = 'DJF',
  /** Danish krone */
  DKK = 'DKK',
  /** Dominican peso */
  DOP = 'DOP',
  /** Algerian dinar */
  DZD = 'DZD',
  /** Egyptian pound */
  EGP = 'EGP',
  /** Eritrean nakfa */
  ERN = 'ERN',
  /** Ethiopian birr */
  ETB = 'ETB',
  /** Euro */
  EUR = 'EUR',
  /** Fiji dollar */
  FJD = 'FJD',
  /** Falkland Islands pound */
  FKP = 'FKP',
  /** Pound sterling */
  GBP = 'GBP',
  /** Georgian lari */
  GEL = 'GEL',
  /** Ghanaian cedi */
  GHS = 'GHS',
  /** Gibraltar pound */
  GIP = 'GIP',
  /** Gambian dalasi */
  GMD = 'GMD',
  /** Guinean franc */
  GNF = 'GNF',
  /** Guatemalan quetzal */
  GTQ = 'GTQ',
  /** Guyanese dollar */
  GYD = 'GYD',
  /** Hong Kong dollar */
  HKD = 'HKD',
  /** Honduran lempira */
  HNL = 'HNL',
  /** Croatian kuna */
  HRK = 'HRK',
  /** Haitian gourde */
  HTG = 'HTG',
  /** Hungarian forint */
  HUF = 'HUF',
  /** Indonesian rupiah */
  IDR = 'IDR',
  /** Israeli new shekel */
  ILS = 'ILS',
  /** Indian rupee */
  INR = 'INR',
  /** Iraqi dinar */
  IQD = 'IQD',
  /** Iranian rial */
  IRR = 'IRR',
  /** Icelandic króna */
  ISK = 'ISK',
  /** Jamaican dollar */
  JMD = 'JMD',
  /** Jordanian dinar */
  JOD = 'JOD',
  /** Japanese yen */
  JPY = 'JPY',
  /** Kenyan shilling */
  KES = 'KES',
  /** Kyrgyzstani som */
  KGS = 'KGS',
  /** Cambodian riel */
  KHR = 'KHR',
  /** Comoro franc */
  KMF = 'KMF',
  /** North Korean won */
  KPW = 'KPW',
  /** South Korean won */
  KRW = 'KRW',
  /** Kuwaiti dinar */
  KWD = 'KWD',
  /** Cayman Islands dollar */
  KYD = 'KYD',
  /** Kazakhstani tenge */
  KZT = 'KZT',
  /** Lao kip */
  LAK = 'LAK',
  /** Lebanese pound */
  LBP = 'LBP',
  /** Sri Lankan rupee */
  LKR = 'LKR',
  /** Liberian dollar */
  LRD = 'LRD',
  /** Lesotho loti */
  LSL = 'LSL',
  /** Libyan dinar */
  LYD = 'LYD',
  /** Moroccan dirham */
  MAD = 'MAD',
  /** Moldovan leu */
  MDL = 'MDL',
  /** Malagasy ariary */
  MGA = 'MGA',
  /** Macedonian denar */
  MKD = 'MKD',
  /** Myanmar kyat */
  MMK = 'MMK',
  /** Mongolian tögrög */
  MNT = 'MNT',
  /** Macanese pataca */
  MOP = 'MOP',
  /** Mauritanian ouguiya */
  MRU = 'MRU',
  /** Mauritian rupee */
  MUR = 'MUR',
  /** Maldivian rufiyaa */
  MVR = 'MVR',
  /** Malawian kwacha */
  MWK = 'MWK',
  /** Mexican peso */
  MXN = 'MXN',
  /** Malaysian ringgit */
  MYR = 'MYR',
  /** Mozambican metical */
  MZN = 'MZN',
  /** Namibian dollar */
  NAD = 'NAD',
  /** Nigerian naira */
  NGN = 'NGN',
  /** Nicaraguan córdoba */
  NIO = 'NIO',
  /** Norwegian krone */
  NOK = 'NOK',
  /** Nepalese rupee */
  NPR = 'NPR',
  /** New Zealand dollar */
  NZD = 'NZD',
  /** Omani rial */
  OMR = 'OMR',
  /** Panamanian balboa */
  PAB = 'PAB',
  /** Peruvian sol */
  PEN = 'PEN',
  /** Papua New Guinean kina */
  PGK = 'PGK',
  /** Philippine peso */
  PHP = 'PHP',
  /** Pakistani rupee */
  PKR = 'PKR',
  /** Polish złoty */
  PLN = 'PLN',
  /** Paraguayan guaraní */
  PYG = 'PYG',
  /** Qatari riyal */
  QAR = 'QAR',
  /** Romanian leu */
  RON = 'RON',
  /** Serbian dinar */
  RSD = 'RSD',
  /** Russian ruble */
  RUB = 'RUB',
  /** Rwandan franc */
  RWF = 'RWF',
  /** Saudi riyal */
  SAR = 'SAR',
  /** Solomon Islands dollar */
  SBD = 'SBD',
  /** Seychelles rupee */
  SCR = 'SCR',
  /** Sudanese pound */
  SDG = 'SDG',
  /** Swedish krona/kronor */
  SEK = 'SEK',
  /** Singapore dollar */
  SGD = 'SGD',
  /** Saint Helena pound */
  SHP = 'SHP',
  /** Sierra Leonean leone */
  SLL = 'SLL',
  /** Somali shilling */
  SOS = 'SOS',
  /** Surinamese dollar */
  SRD = 'SRD',
  /** South Sudanese pound */
  SSP = 'SSP',
  /** São Tomé and Príncipe dobra */
  STN = 'STN',
  /** Salvadoran colón */
  SVC = 'SVC',
  /** Syrian pound */
  SYP = 'SYP',
  /** Swazi lilangeni */
  SZL = 'SZL',
  /** Thai baht */
  THB = 'THB',
  /** Tajikistani somoni */
  TJS = 'TJS',
  /** Turkmenistan manat */
  TMT = 'TMT',
  /** Tunisian dinar */
  TND = 'TND',
  /** Tongan paʻanga */
  TOP = 'TOP',
  /** Turkish lira */
  TRY = 'TRY',
  /** Trinidad and Tobago dollar */
  TTD = 'TTD',
  /** New Taiwan dollar */
  TWD = 'TWD',
  /** Tanzanian shilling */
  TZS = 'TZS',
  /** Ukrainian hryvnia */
  UAH = 'UAH',
  /** Ugandan shilling */
  UGX = 'UGX',
  /** United States dollar */
  USD = 'USD',
  /** Uruguayan peso */
  UYU = 'UYU',
  /** Uzbekistan som */
  UZS = 'UZS',
  /** Venezuelan bolívar soberano */
  VES = 'VES',
  /** Vietnamese đồng */
  VND = 'VND',
  /** Vanuatu vatu */
  VUV = 'VUV',
  /** Samoan tala */
  WST = 'WST',
  /** CFA franc BEAC */
  XAF = 'XAF',
  /** East Caribbean dollar */
  XCD = 'XCD',
  /** CFA franc BCEAO */
  XOF = 'XOF',
  /** CFP franc (franc Pacifique) */
  XPF = 'XPF',
  /** Yemeni rial */
  YER = 'YER',
  /** South African rand */
  ZAR = 'ZAR',
  /** Zambian kwacha */
  ZMW = 'ZMW',
  /** Zimbabwean dollar */
  ZWL = 'ZWL'
}

export type CurrentUser = {
  __typename?: 'CurrentUser';
  id: Scalars['ID'];
  permissions: Array<Permission>;
  token: Scalars['String'];
};

export type Customer = Node & {
  __typename?: 'Customer';
  createdAt: Scalars['DateTime'];
  emailAddress: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  phoneNumber?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type CustomerList = PaginatedList & {
  __typename?: 'CustomerList';
  items: Array<Customer>;
  totalItems: Scalars['Int'];
};

export type DateOperators = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  between?: InputMaybe<DateRange>;
  eq?: InputMaybe<Scalars['DateTime']>;
};

export type DateRange = {
  end: Scalars['DateTime'];
  start: Scalars['DateTime'];
};

export type DeletionResponse = {
  __typename?: 'DeletionResponse';
  message?: Maybe<Scalars['String']>;
  result: DeletionResult;
};

export enum DeletionResult {
  /** 实体删除成功 */
  DELETED = 'DELETED',
  /** 未删除，原因请见消息描述 */
  NOT_DELETED = 'NOT_DELETED'
}

/** 作品的价格配置 */
export type DiffPriceOption = {
  __typename?: 'DiffPriceOption';
  /** 说明信息 */
  info?: Maybe<Scalars['String']>;
  /** 价格 */
  price: Scalars['Float'];
  /** 版本名称 */
  versionName?: Maybe<Scalars['String']>;
};

export type Discount = {
  __typename?: 'Discount';
  adjustmentSource: Scalars['String'];
  amount: Scalars['Int'];
  amountWithTax: Scalars['Int'];
  description: Scalars['String'];
  type: AdjustmentType;
};

/** 电子邮箱地址冲突时返回 */
export type EmailAddressConflictError = ErrorResult & {
  __typename?: 'EmailAddressConflictError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export enum ErrorCode {
  ALREADY_LOGGED_IN_ERROR = 'ALREADY_LOGGED_IN_ERROR',
  EMAIL_ADDRESS_CONFLICT_ERROR = 'EMAIL_ADDRESS_CONFLICT_ERROR',
  IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR = 'IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR',
  IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR = 'IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR',
  INVALID_CREDENTIALS_ERROR = 'INVALID_CREDENTIALS_ERROR',
  MISSING_PASSWORD_ERROR = 'MISSING_PASSWORD_ERROR',
  NAME_CONFLICT_ERROR = 'NAME_CONFLICT_ERROR',
  NATIVE_AUTH_STRATEGY_ERROR = 'NATIVE_AUTH_STRATEGY_ERROR',
  NOT_VERIFIED_ERROR = 'NOT_VERIFIED_ERROR',
  NO_ACTIVE_ORDER_ERROR = 'NO_ACTIVE_ORDER_ERROR',
  PASSWORD_ALREADY_SET_ERROR = 'PASSWORD_ALREADY_SET_ERROR',
  PASSWORD_RESET_TOKEN_EXPIRED_ERROR = 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR',
  PASSWORD_RESET_TOKEN_INVALID_ERROR = 'PASSWORD_RESET_TOKEN_INVALID_ERROR',
  PASSWORD_VALIDATION_ERROR = 'PASSWORD_VALIDATION_ERROR',
  PHONE_CONFLICT_ERROR = 'PHONE_CONFLICT_ERROR',
  SLUG_CONFLICT_ERROR = 'SLUG_CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VERIFICATION_TOKEN_EXPIRED_ERROR = 'VERIFICATION_TOKEN_EXPIRED_ERROR',
  VERIFICATION_TOKEN_INVALID_ERROR = 'VERIFICATION_TOKEN_INVALID_ERROR'
}

export type ErrorResult = {
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type Fulfillment = Node & {
  __typename?: 'Fulfillment';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  method: Scalars['String'];
  orderItems: Array<OrderItem>;
  state: Scalars['String'];
  trackingCode?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export enum GlobalFlag {
  FALSE = 'FALSE',
  INHERIT = 'INHERIT',
  TRUE = 'TRUE'
}

export type HistoryEntry = Node & {
  __typename?: 'HistoryEntry';
  createdAt: Scalars['DateTime'];
  data: Scalars['JSON'];
  id: Scalars['ID'];
  type: HistoryEntryType;
  updatedAt: Scalars['DateTime'];
};

export type HistoryEntryFilterParameter = {
  createdAt?: InputMaybe<DateOperators>;
  type?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type HistoryEntryList = PaginatedList & {
  __typename?: 'HistoryEntryList';
  items: Array<HistoryEntry>;
  totalItems: Scalars['Int'];
};

export type HistoryEntryListOptions = {
  /** 允许过滤结果 */
  filter?: InputMaybe<HistoryEntryFilterParameter>;
  /** 指定多个 "filters" 参数是否应该与逻辑的 AND 或 OR 操作组合，默认为 AND */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** 跳过前n个结果以用于分页 */
  skip?: InputMaybe<Scalars['Int']>;
  /** 指定根据哪些属性对结果进行排序 */
  sort?: InputMaybe<HistoryEntrySortParameter>;
  /** 获取n个结果，用于分页 */
  take?: InputMaybe<Scalars['Int']>;
};

export type HistoryEntrySortParameter = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export enum HistoryEntryType {
  CUSTOMER_ADDED_TO_GROUP = 'CUSTOMER_ADDED_TO_GROUP',
  CUSTOMER_ADDRESS_CREATED = 'CUSTOMER_ADDRESS_CREATED',
  CUSTOMER_ADDRESS_DELETED = 'CUSTOMER_ADDRESS_DELETED',
  CUSTOMER_ADDRESS_UPDATED = 'CUSTOMER_ADDRESS_UPDATED',
  CUSTOMER_DETAIL_UPDATED = 'CUSTOMER_DETAIL_UPDATED',
  CUSTOMER_EMAIL_UPDATE_REQUESTED = 'CUSTOMER_EMAIL_UPDATE_REQUESTED',
  CUSTOMER_EMAIL_UPDATE_VERIFIED = 'CUSTOMER_EMAIL_UPDATE_VERIFIED',
  CUSTOMER_NOTE = 'CUSTOMER_NOTE',
  CUSTOMER_PASSWORD_RESET_REQUESTED = 'CUSTOMER_PASSWORD_RESET_REQUESTED',
  CUSTOMER_PASSWORD_RESET_VERIFIED = 'CUSTOMER_PASSWORD_RESET_VERIFIED',
  CUSTOMER_PASSWORD_UPDATED = 'CUSTOMER_PASSWORD_UPDATED',
  CUSTOMER_REGISTERED = 'CUSTOMER_REGISTERED',
  CUSTOMER_REMOVED_FROM_GROUP = 'CUSTOMER_REMOVED_FROM_GROUP',
  CUSTOMER_VERIFIED = 'CUSTOMER_VERIFIED',
  ORDER_CANCELLATION = 'ORDER_CANCELLATION',
  ORDER_COUPON_APPLIED = 'ORDER_COUPON_APPLIED',
  ORDER_COUPON_REMOVED = 'ORDER_COUPON_REMOVED',
  ORDER_FULFILLMENT = 'ORDER_FULFILLMENT',
  ORDER_FULFILLMENT_TRANSITION = 'ORDER_FULFILLMENT_TRANSITION',
  ORDER_MODIFIED = 'ORDER_MODIFIED',
  ORDER_NOTE = 'ORDER_NOTE',
  ORDER_PAYMENT_TRANSITION = 'ORDER_PAYMENT_TRANSITION',
  ORDER_REFUND_TRANSITION = 'ORDER_REFUND_TRANSITION',
  ORDER_STATE_TRANSITION = 'ORDER_STATE_TRANSITION'
}

/**
 * Returned if the token used to change a Customer's email address is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type IdentifierChangeTokenExpiredError = ErrorResult & {
  __typename?: 'IdentifierChangeTokenExpiredError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/**
 * Returned if the token used to change a Customer's email address is either
 * invalid or does not match any expected tokens.
 */
export type IdentifierChangeTokenInvalidError = ErrorResult & {
  __typename?: 'IdentifierChangeTokenInvalidError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/** 如果用户身份验证凭证无效则返回 */
export type InvalidCredentialsError = ErrorResult & {
  __typename?: 'InvalidCredentialsError';
  authenticationError: Scalars['String'];
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export enum JobState {
  /** 取消 */
  CANCELLED = 'CANCELLED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 错误 */
  FAILED = 'FAILED',
  /** 等待 */
  PENDING = 'PENDING',
  /** 重试 */
  RETRYING = 'RETRYING',
  /** 运行 */
  RUNNING = 'RUNNING'
}

/**
 * @description
 * 具有可选区域或脚本修饰符的（例如 de_AT）的 ISO 639-1 语言代码形式。
 * 可用于选择基于 [Unicode CLDR 描述列表](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)，
 * 包括了世界上主要的标准语言和方言
 * @docsCategory common
 */
export enum LanguageCode {
  /** Afrikaans */
  af = 'af',
  /** Akan */
  ak = 'ak',
  /** Amharic */
  am = 'am',
  /** Arabic */
  ar = 'ar',
  /** Assamese */
  as = 'as',
  /** Azerbaijani */
  az = 'az',
  /** Belarusian */
  be = 'be',
  /** Bulgarian */
  bg = 'bg',
  /** Bambara */
  bm = 'bm',
  /** Bangla */
  bn = 'bn',
  /** Tibetan */
  bo = 'bo',
  /** Breton */
  br = 'br',
  /** Bosnian */
  bs = 'bs',
  /** Catalan */
  ca = 'ca',
  /** Chechen */
  ce = 'ce',
  /** Corsican */
  co = 'co',
  /** Czech */
  cs = 'cs',
  /** Church Slavic */
  cu = 'cu',
  /** Welsh */
  cy = 'cy',
  /** Danish */
  da = 'da',
  /** German */
  de = 'de',
  /** Austrian German */
  de_AT = 'de_AT',
  /** Swiss High German */
  de_CH = 'de_CH',
  /** Dzongkha */
  dz = 'dz',
  /** Ewe */
  ee = 'ee',
  /** Greek */
  el = 'el',
  /** English */
  en = 'en',
  /** Australian English */
  en_AU = 'en_AU',
  /** Canadian English */
  en_CA = 'en_CA',
  /** British English */
  en_GB = 'en_GB',
  /** American English */
  en_US = 'en_US',
  /** Esperanto */
  eo = 'eo',
  /** Spanish */
  es = 'es',
  /** European Spanish */
  es_ES = 'es_ES',
  /** Mexican Spanish */
  es_MX = 'es_MX',
  /** Estonian */
  et = 'et',
  /** Basque */
  eu = 'eu',
  /** Persian */
  fa = 'fa',
  /** Dari */
  fa_AF = 'fa_AF',
  /** Fulah */
  ff = 'ff',
  /** Finnish */
  fi = 'fi',
  /** Faroese */
  fo = 'fo',
  /** French */
  fr = 'fr',
  /** Canadian French */
  fr_CA = 'fr_CA',
  /** Swiss French */
  fr_CH = 'fr_CH',
  /** Western Frisian */
  fy = 'fy',
  /** Irish */
  ga = 'ga',
  /** Scottish Gaelic */
  gd = 'gd',
  /** Galician */
  gl = 'gl',
  /** Gujarati */
  gu = 'gu',
  /** Manx */
  gv = 'gv',
  /** Hausa */
  ha = 'ha',
  /** Hebrew */
  he = 'he',
  /** Hindi */
  hi = 'hi',
  /** Croatian */
  hr = 'hr',
  /** Haitian Creole */
  ht = 'ht',
  /** Hungarian */
  hu = 'hu',
  /** Armenian */
  hy = 'hy',
  /** Interlingua */
  ia = 'ia',
  /** Indonesian */
  id = 'id',
  /** Igbo */
  ig = 'ig',
  /** Sichuan Yi */
  ii = 'ii',
  /** Icelandic */
  is = 'is',
  /** Italian */
  it = 'it',
  /** Japanese */
  ja = 'ja',
  /** Javanese */
  jv = 'jv',
  /** Georgian */
  ka = 'ka',
  /** Kikuyu */
  ki = 'ki',
  /** Kazakh */
  kk = 'kk',
  /** Kalaallisut */
  kl = 'kl',
  /** Khmer */
  km = 'km',
  /** Kannada */
  kn = 'kn',
  /** Korean */
  ko = 'ko',
  /** Kashmiri */
  ks = 'ks',
  /** Kurdish */
  ku = 'ku',
  /** Cornish */
  kw = 'kw',
  /** Kyrgyz */
  ky = 'ky',
  /** Latin */
  la = 'la',
  /** Luxembourgish */
  lb = 'lb',
  /** Ganda */
  lg = 'lg',
  /** Lingala */
  ln = 'ln',
  /** Lao */
  lo = 'lo',
  /** Lithuanian */
  lt = 'lt',
  /** Luba-Katanga */
  lu = 'lu',
  /** Latvian */
  lv = 'lv',
  /** Malagasy */
  mg = 'mg',
  /** Maori */
  mi = 'mi',
  /** Macedonian */
  mk = 'mk',
  /** Malayalam */
  ml = 'ml',
  /** Mongolian */
  mn = 'mn',
  /** Marathi */
  mr = 'mr',
  /** Malay */
  ms = 'ms',
  /** Maltese */
  mt = 'mt',
  /** Burmese */
  my = 'my',
  /** Norwegian Bokmål */
  nb = 'nb',
  /** North Ndebele */
  nd = 'nd',
  /** Nepali */
  ne = 'ne',
  /** Dutch */
  nl = 'nl',
  /** Flemish */
  nl_BE = 'nl_BE',
  /** Norwegian Nynorsk */
  nn = 'nn',
  /** Nyanja */
  ny = 'ny',
  /** Oromo */
  om = 'om',
  /** Odia */
  or = 'or',
  /** Ossetic */
  os = 'os',
  /** Punjabi */
  pa = 'pa',
  /** Polish */
  pl = 'pl',
  /** Pashto */
  ps = 'ps',
  /** Portuguese */
  pt = 'pt',
  /** Brazilian Portuguese */
  pt_BR = 'pt_BR',
  /** European Portuguese */
  pt_PT = 'pt_PT',
  /** Quechua */
  qu = 'qu',
  /** Romansh */
  rm = 'rm',
  /** Rundi */
  rn = 'rn',
  /** Romanian */
  ro = 'ro',
  /** Moldavian */
  ro_MD = 'ro_MD',
  /** Russian */
  ru = 'ru',
  /** Kinyarwanda */
  rw = 'rw',
  /** Sanskrit */
  sa = 'sa',
  /** Sindhi */
  sd = 'sd',
  /** Northern Sami */
  se = 'se',
  /** Sango */
  sg = 'sg',
  /** Sinhala */
  si = 'si',
  /** Slovak */
  sk = 'sk',
  /** Slovenian */
  sl = 'sl',
  /** Samoan */
  sm = 'sm',
  /** Shona */
  sn = 'sn',
  /** Somali */
  so = 'so',
  /** Albanian */
  sq = 'sq',
  /** Serbian */
  sr = 'sr',
  /** Southern Sotho */
  st = 'st',
  /** Sundanese */
  su = 'su',
  /** Swedish */
  sv = 'sv',
  /** Swahili */
  sw = 'sw',
  /** Congo Swahili */
  sw_CD = 'sw_CD',
  /** Tamil */
  ta = 'ta',
  /** Telugu */
  te = 'te',
  /** Tajik */
  tg = 'tg',
  /** Thai */
  th = 'th',
  /** Tigrinya */
  ti = 'ti',
  /** Turkmen */
  tk = 'tk',
  /** Tongan */
  to = 'to',
  /** Turkish */
  tr = 'tr',
  /** Tatar */
  tt = 'tt',
  /** Uyghur */
  ug = 'ug',
  /** Ukrainian */
  uk = 'uk',
  /** Urdu */
  ur = 'ur',
  /** Uzbek */
  uz = 'uz',
  /** Vietnamese */
  vi = 'vi',
  /** Volapük */
  vo = 'vo',
  /** Wolof */
  wo = 'wo',
  /** Xhosa */
  xh = 'xh',
  /** Yiddish */
  yi = 'yi',
  /** Yoruba */
  yo = 'yo',
  /** Chinese */
  zh = 'zh',
  /** Simplified Chinese */
  zh_Hans = 'zh_Hans',
  /** Traditional Chinese */
  zh_Hant = 'zh_Hant',
  /** Zulu */
  zu = 'zu'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

/** Menu item 的类型 */
export enum MenuObjectType {
  CATEGORY = 'CATEGORY',
  LINK = 'LINK',
  PAGE = 'PAGE',
  POST = 'POST',
  PRODUCT = 'PRODUCT'
}

/** Returned when attempting to register or verify a customer account without a password, when one is required. */
export type MissingPasswordError = ErrorResult & {
  __typename?: 'MissingPasswordError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login?: Maybe<Scalars['JSON']>;
  logout: Success;
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  rememberMe?: InputMaybe<Scalars['Boolean']>;
  username: Scalars['String'];
};

/** 名字冲突错误 */
export type NameConflictError = ErrorResult & {
  __typename?: 'NameConflictError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type NativeAuthInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

/** 如果未配置该策略，则在尝试依赖 NativeAuthStrategy 的操作时返回 */
export type NativeAuthStrategyError = ErrorResult & {
  __typename?: 'NativeAuthStrategyError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/** 导航菜单项 */
export type NavMenuItem = {
  __typename?: 'NavMenuItem';
  /** 菜单对象ID */
  objectId?: Maybe<Scalars['ID']>;
  /** 菜单类型 */
  objectType: MenuObjectType;
  /** 菜单URL 或 slug */
  url?: Maybe<Scalars['String']>;
};

/**
 * Returned when invoking a mutation which depends on there being an active Order on the
 * current session.
 */
export type NoActiveOrderError = ErrorResult & {
  __typename?: 'NoActiveOrderError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type Node = {
  id: Scalars['ID'];
};

/**
 * Returned if `authOptions.requireVerification` is set to `true` (which is the default)
 * and an unverified user attempts to authenticate.
 */
export type NotVerifiedError = ErrorResult & {
  __typename?: 'NotVerifiedError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export type NumberOperators = {
  between?: InputMaybe<NumberRange>;
  eq?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
};

export type NumberRange = {
  end: Scalars['Float'];
  start: Scalars['Float'];
};

export type Order = Node & {
  __typename?: 'Order';
  /** 只要付款流程尚未完成，订单就处于活动状态 */
  active: Scalars['Boolean'];
  billingAddress?: Maybe<OrderAddress>;
  /** 一个唯一的订单编码 */
  code: Scalars['String'];
  /** 应用于该订单的所有优惠券代码的数组 */
  couponCodes: Array<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  /** 货币代码 */
  currencyCode: CurrencyCode;
  customer?: Maybe<Customer>;
  discounts: Array<Discount>;
  fulfillments?: Maybe<Array<Fulfillment>>;
  history: HistoryEntryList;
  id: Scalars['ID'];
  /** 下单的日期和时间，即客户完成结账，下单不再"活动" */
  orderPlacedAt?: Maybe<Scalars['DateTime']>;
  /** 支付方法 */
  payments?: Maybe<Array<Payment>>;
  /** 该订单适用于促销。只有在支付过程完成后才会出现 */
  promotions: Array<Promotion>;
  shipping: Scalars['Int'];
  shippingAddress?: Maybe<OrderAddress>;
  shippingLines: Array<ShippingLine>;
  shippingWithTax: Scalars['Int'];
  state: Scalars['String'];
  /**
   * subTotal 是 Order 中所有 orderline 的总和。这个数字还包括在 OrderItems 中按比例（按比例分布）分配的任何订单级折扣。
   * 要获得所有不占比例折扣的 OrderLine 的总和，使用 `OrderLine.discountedLinePrice` 值。
   */
  subTotal: Scalars['Int'];
  /** 与小计相同，但包括税金 */
  subTotalWithTax: Scalars['Int'];
  /**
   * 附加费用是对订单总额的任意修改，两者都不是产品变量或因使用促销而产生的折扣。
   * 例如，基于客户互动的一次性折扣，或基于付款的附加费方法。
   */
  surcharges: Array<Surcharge>;
  /** 税种摘要 */
  taxSummary: Array<OrderTaxSummary>;
  /** 等于 subTotal 加上 shipping */
  total: Scalars['Int'];
  totalQuantity: Scalars['Int'];
  /** 最终应付金额。等于 subTotalWithTax 加上 shippingWithTax */
  totalWithTax: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};


export type OrderHistoryArgs = {
  options?: InputMaybe<HistoryEntryListOptions>;
};

export type OrderAddress = {
  __typename?: 'OrderAddress';
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  countryCode?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  province?: Maybe<Scalars['String']>;
  streetLine1?: Maybe<Scalars['String']>;
  streetLine2?: Maybe<Scalars['String']>;
};

export type OrderItem = Node & {
  __typename?: 'OrderItem';
  adjustments: Array<Adjustment>;
  cancelled: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  /**
   * 单价含折扣，不含税。
   *
   * 如果应用了订单级折扣，这将不是实际的应税单价(参见`proratedUnitPrice`)，
   * 但通常是显示给客户的正确价格，以避免对分布式订单级折扣的内部处理造成混淆。
   */
  discountedUnitPrice: Scalars['Int'];
  /** 单价（含折扣和税） */
  discountedUnitPriceWithTax: Scalars['Int'];
  fulfillment?: Maybe<Fulfillment>;
  id: Scalars['ID'];
  /**
   * The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
   * Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
   * and refund calculations.
   * 考虑商品折扣和按比例分配的实际单价。
   * Order-level折扣。该值是OrderItem的真实经济值，用于税收和退款计算。
   */
  proratedUnitPrice: Scalars['Int'];
  /** 按比例计算的单价(含税) */
  proratedUnitPriceWithTax: Scalars['Int'];
  refundId?: Maybe<Scalars['ID']>;
  taxLines: Array<TaxLine>;
  taxRate: Scalars['Float'];
  /** 单价，不含税和折扣 */
  unitPrice: Scalars['Int'];
  /** 单价，含税但不含折扣 */
  unitPriceWithTax: Scalars['Int'];
  unitTax: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type OrderList = PaginatedList & {
  __typename?: 'OrderList';
  items: Array<Order>;
  totalItems: Scalars['Int'];
};

/** 订单适用的税种摘要，按分组税率 */
export type OrderTaxSummary = {
  __typename?: 'OrderTaxSummary';
  /** A description of this tax */
  description: Scalars['String'];
  /** 适用本税率的订单项目总净价格 */
  taxBase: Scalars['Int'];
  /** 以百分比计算的税率 */
  taxRate: Scalars['Float'];
  /** 订单所适用的总税额按本税率计算 */
  taxTotal: Scalars['Int'];
};

export type PageSetting = {
  __typename?: 'PageSetting';
  template?: Maybe<Scalars['String']>;
};

export type PaginatedList = {
  items: Array<Node>;
  totalItems: Scalars['Int'];
};

/** Returned when attempting to verify a customer account with a password, when a password has already been set. */
export type PasswordAlreadySetError = ErrorResult & {
  __typename?: 'PasswordAlreadySetError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/**
 * Returned if the token used to reset a Customer's password is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type PasswordResetTokenExpiredError = ErrorResult & {
  __typename?: 'PasswordResetTokenExpiredError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/**
 * Returned if the token used to reset a Customer's password is either
 * invalid or does not match any expected tokens.
 */
export type PasswordResetTokenInvalidError = ErrorResult & {
  __typename?: 'PasswordResetTokenInvalidError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/** Returned when attempting to register or verify a customer account where the given password fails password validation. */
export type PasswordValidationError = ErrorResult & {
  __typename?: 'PasswordValidationError';
  errorCode: ErrorCode;
  message: Scalars['String'];
  validationErrorMessage: Scalars['String'];
};

export type Payment = Node & {
  __typename?: 'Payment';
  amount: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  errorMessage?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  metadata?: Maybe<Scalars['JSON']>;
  method: Scalars['String'];
  refunds: Array<Refund>;
  state: Scalars['String'];
  transactionId?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

/**
 * @description
 * 管理员和客户权限。用于通过 {@link Allow} 装饰器控制对 GraphQL 解析器的访问
 * @docsCategory common
 */
export enum Permission {
  /** Authenticated 仅意味着用户已经登录 */
  Authenticated = 'Authenticated',
  /** 授权限给 create Administrator */
  CreateAdministrator = 'CreateAdministrator',
  /** 授权限给 create Asset */
  CreateAsset = 'CreateAsset',
  /** 授权限给 create Assets, Collections */
  CreateCatalog = 'CreateCatalog',
  /** 授权限给 create Post */
  CreatePost = 'CreatePost',
  /** 授权限给 create Product */
  CreateProduct = 'CreateProduct',
  /** 授权限给 create System & GlobalSettings */
  CreateSettings = 'CreateSettings',
  /** 授权限给 create System */
  CreateSystem = 'CreateSystem',
  /** 授权限给 create Tag */
  CreateTag = 'CreateTag',
  /** 授权限给 delete Administrator */
  DeleteAdministrator = 'DeleteAdministrator',
  /** 授权限给 delete Asset */
  DeleteAsset = 'DeleteAsset',
  /** 授权限给 delete Assets, Collections */
  DeleteCatalog = 'DeleteCatalog',
  /** 授权限给 delete Post */
  DeletePost = 'DeletePost',
  /** 授权限给 delete Product */
  DeleteProduct = 'DeleteProduct',
  /** 授权限给 delete System & GlobalSettings */
  DeleteSettings = 'DeleteSettings',
  /** 授权限给 delete System */
  DeleteSystem = 'DeleteSystem',
  /** 授权限给 delete Tag */
  DeleteTag = 'DeleteTag',
  /** Owner 指用户拥有该实体，例如客户自己的订单 */
  Owner = 'Owner',
  /** Public 表示任何未经身份验证的用户都可能执行该操作 */
  Public = 'Public',
  /** 授权限给 read Administrator */
  ReadAdministrator = 'ReadAdministrator',
  /** 授权限给 read Asset */
  ReadAsset = 'ReadAsset',
  /** 授权限给 read Assets, Collections */
  ReadCatalog = 'ReadCatalog',
  /** 授权限给 read Post */
  ReadPost = 'ReadPost',
  /** 授权限给 read Product */
  ReadProduct = 'ReadProduct',
  /** 授权限给 read System & GlobalSettings */
  ReadSettings = 'ReadSettings',
  /** 授权限给 read System */
  ReadSystem = 'ReadSystem',
  /** 授权限给 read Tag */
  ReadTag = 'ReadTag',
  /** SuperAdmin 可以不受限制地进入所有操作 */
  SuperAdmin = 'SuperAdmin',
  /** 授权限给 update Administrator */
  UpdateAdministrator = 'UpdateAdministrator',
  /** 授权限给 update Asset */
  UpdateAsset = 'UpdateAsset',
  /** 授权限给 update Assets, Collections */
  UpdateCatalog = 'UpdateCatalog',
  /** 授权更新 GlobalSettings */
  UpdateGlobalSettings = 'UpdateGlobalSettings',
  /** 授权限给 update Post */
  UpdatePost = 'UpdatePost',
  /** 授权限给 update Product */
  UpdateProduct = 'UpdateProduct',
  /** 授权限给 update System & GlobalSettings */
  UpdateSettings = 'UpdateSettings',
  /** 授权限给 update System */
  UpdateSystem = 'UpdateSystem',
  /** 授权限给 update Tag */
  UpdateTag = 'UpdateTag'
}

/** 手机号冲突错误 */
export type PhoneConflictError = ErrorResult & {
  __typename?: 'PhoneConflictError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/** 内容 */
export type Post = Node & {
  __typename?: 'Post';
  /** 是否允许评论 */
  allowComment?: Maybe<Scalars['Boolean']>;
  /** 内容中相关资产 */
  assets?: Maybe<Array<Maybe<Asset>>>;
  /** 评论数 */
  commentCount?: Maybe<Scalars['Int']>;
  /** 作品内容 */
  content: Scalars['JSON'];
  createdAt: Scalars['DateTime'];
  /** 作者 */
  creator?: Maybe<User>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** 文章描述 */
  description: Scalars['String'];
  /** 内容特色图片 */
  featured?: Maybe<Asset>;
  id: Scalars['ID'];
  /** Post 元数据 */
  meta?: Maybe<PostMeta>;
  /** 排序 */
  order?: Maybe<Scalars['Int']>;
  /** 父内容 */
  parent?: Maybe<Scalars['ID']>;
  /** 文章标识 */
  slug: Scalars['String'];
  /** 作品发布状态 */
  state?: Maybe<PostState>;
  /** 分类 */
  terms?: Maybe<Array<Term>>;
  /** 文章标题 */
  title?: Maybe<Scalars['String']>;
  /** 内容类型 */
  type: PostType;
  updatedAt: Scalars['DateTime'];
};

/** 内容列表 */
export type PostList = PaginatedList & {
  __typename?: 'PostList';
  items: Array<Post>;
  totalItems: Scalars['Int'];
};

export type PostMeta = {
  __typename?: 'PostMeta';
  detail?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

/** 内容发布状态 */
export enum PostState {
  /** 存档 */
  ARCHIVED = 'ARCHIVED',
  /** 草稿 */
  DRAFT = 'DRAFT',
  /** 发布 */
  PUBLISH = 'PUBLISH'
}

/** 内容类型 */
export enum PostType {
  /** 导航项 */
  NAV_MENU_ITEM = 'NAV_MENU_ITEM',
  /** 页面 */
  PAGE = 'PAGE',
  /** 博客文章 */
  POST = 'POST',
  /** 产品 */
  PRODUCT = 'PRODUCT'
}

/** 产品类别 */
export enum ProductCategory {
  /** 资料 */
  DATA = 'DATA',
  /** 绘画 */
  DRAWING = 'DRAWING',
  /** 游戏 */
  GAME = 'GAME',
  /** 生活 */
  LIFE = 'LIFE',
  /** 受限制 */
  LIMITED = 'LIMITED',
  /** 素材 */
  MATERIAL = 'MATERIAL',
  /** 其它 */
  OTHER = 'OTHER',
  /** 播客 */
  PODCAST = 'PODCAST',
  /** 私密 */
  PRIVATE = 'PRIVATE',
  /** 学习 */
  STUDY = 'STUDY',
  /** 科技 */
  TECHNOLOGY = 'TECHNOLOGY',
  /** 手账 LIFE BOOK */
  TECHO = 'TECHO',
  /** 未分类 */
  UNCATEGORIZED = 'UNCATEGORIZED',
  /** 视频 */
  VIDEO = 'VIDEO',
  /** 写作 */
  WRITING = 'WRITING'
}

export type ProductSetting = {
  __typename?: 'ProductSetting';
  /** 作品差异化定价 */
  diffPrice?: Maybe<Array<Maybe<DiffPriceOption>>>;
  /** 作品定价 */
  price: Scalars['Float'];
  /** 作品保护配置 */
  protect?: Maybe<Array<Maybe<ProtectOption>>>;
  /** 订阅周期 */
  subscription?: Maybe<ProductSubscriptionPeriod>;
};

/** 作品状态 */
export enum ProductState {
  /** 存档 */
  ARCHIVED = 'ARCHIVED',
  /** 草稿 */
  DRAFT = 'DRAFT',
  /** 发布 */
  PUBLISH = 'PUBLISH'
}

/** 产品订阅周期 */
export enum ProductSubscriptionPeriod {
  /** 月订阅 */
  MONTH = 'MONTH',
  /** 年订阅 */
  YEAR = 'YEAR'
}

/** 作品商品类型 */
export enum ProductType {
  /**
   * 有声读物
   * 让客户听你的音频内容。
   */
  AUDIOBOOK = 'AUDIOBOOK',
  /**
   * 课程或教程
   * 卖一节课或教一群学生
   */
  COURSE_TUTORIAL = 'COURSE_TUTORIAL',
  /**
   * 数字产品
   * 任何要下载或流媒体的文件集。
   */
  DIGITAL = 'DIGITAL',
  /** 提供PDF、ePub和Mobi格式的书籍或漫画。 */
  EBOOK = 'EBOOK',
  /**
   * 会员
   * 围绕你的粉丝开展会员业务
   */
  MEMBERSHIP = 'MEMBERSHIP',
  /** 通过电子邮件发布的内容。 */
  NEWSLETTER = 'NEWSLETTER',
  /**
   * 实物产品
   * 出售任何需要运输的东西。
   */
  PHYSICAL_GOOD = 'PHYSICAL_GOOD',
  /**
   * 播客
   * 播客的内容可以使用流媒体直接下载。
   */
  PODCAST = 'PODCAST'
}

/** 促销活动 */
export type Promotion = Node & {
  __typename?: 'Promotion';
  actions: Array<ConfigurableOperation>;
  conditions: Array<ConfigurableOperation>;
  couponCode?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  enabled: Scalars['Boolean'];
  endsAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  perCustomerUsageLimit?: Maybe<Scalars['Int']>;
  startsAt?: Maybe<Scalars['DateTime']>;
  updatedAt: Scalars['DateTime'];
};

export type PromotionList = PaginatedList & {
  __typename?: 'PromotionList';
  items: Array<Promotion>;
  totalItems: Scalars['Int'];
};

/** 作品的保护机制配置 */
export type ProtectOption = {
  __typename?: 'ProtectOption';
  method?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** Returns information about the current authenticated User */
  me?: Maybe<CurrentUser>;
};

export type Refund = Node & {
  __typename?: 'Refund';
  adjustment: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  items: Scalars['Int'];
  metadata?: Maybe<Scalars['JSON']>;
  method?: Maybe<Scalars['String']>;
  orderItems: Array<OrderItem>;
  paymentId: Scalars['ID'];
  reason?: Maybe<Scalars['String']>;
  shipping: Scalars['Int'];
  state: Scalars['String'];
  total: Scalars['Int'];
  transactionId?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type Role = Node & {
  __typename?: 'Role';
  code: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  permissions: Array<Permission>;
  updatedAt: Scalars['DateTime'];
};

export type RoleList = PaginatedList & {
  __typename?: 'RoleList';
  items: Array<Role>;
  totalItems: Scalars['Int'];
};

export type SearchInput = {
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<SearchResultSortParameter>;
  take?: InputMaybe<Scalars['Int']>;
  term?: InputMaybe<Scalars['String']>;
};

export type SearchResultSortParameter = {
  name?: InputMaybe<SortOrder>;
  price?: InputMaybe<SortOrder>;
};

/** 服务类型 */
export enum ServiceType {
  /** 标准服务 */
  NORMAL = 'NORMAL',
  /** 增值服务 */
  VAS = 'VAS'
}

/** 用户 Session 类型 */
export enum SessionType {
  /** 匿名 */
  ANONYMOUS = 'ANONYMOUS',
  /** 授权的 */
  AUTHENTICATED = 'AUTHENTICATED'
}

export type ShippingLine = {
  __typename?: 'ShippingLine';
  discountedPrice: Scalars['Int'];
  discountedPriceWithTax: Scalars['Int'];
  discounts: Array<Discount>;
  price: Scalars['Int'];
  priceWithTax: Scalars['Int'];
  shippingMethod: ShippingMethod;
};

export type ShippingMethod = Node & {
  __typename?: 'ShippingMethod';
  calculator: ConfigurableOperation;
  checker: ConfigurableOperation;
  code: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  fulfillmentHandlerCode: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  translations: Array<ShippingMethodTranslation>;
  updatedAt: Scalars['DateTime'];
};

export type ShippingMethodList = PaginatedList & {
  __typename?: 'ShippingMethodList';
  items: Array<ShippingMethod>;
  totalItems: Scalars['Int'];
};

export type ShippingMethodTranslation = {
  __typename?: 'ShippingMethodTranslation';
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  languageCode: LanguageCode;
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

/** 名字冲突错误 */
export type SlugConflictError = ErrorResult & {
  __typename?: 'SlugConflictError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type StringOperators = {
  contains?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  notContains?: InputMaybe<Scalars['String']>;
  notEq?: InputMaybe<Scalars['String']>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  regex?: InputMaybe<Scalars['String']>;
};

/** 操作成功的指示，这里我们不返回任何具体信息 */
export type Success = {
  __typename?: 'Success';
  success: Scalars['Boolean'];
};

export type Surcharge = Node & {
  __typename?: 'Surcharge';
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  price: Scalars['Int'];
  priceWithTax: Scalars['Int'];
  sku?: Maybe<Scalars['String']>;
  taxLines: Array<TaxLine>;
  taxRate: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
};

export type Tag = Node & {
  __typename?: 'Tag';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  value: Scalars['String'];
};

export type TagList = PaginatedList & {
  __typename?: 'TagList';
  items: Array<Tag>;
  totalItems: Scalars['Int'];
};

export type TaxLine = {
  __typename?: 'TaxLine';
  description: Scalars['String'];
  taxRate: Scalars['Float'];
};

export enum TaxonomyEnum {
  /** 分类 */
  CATEGORY = 'CATEGORY',
  /** 链接分类 */
  LINK_CATEGORY = 'LINK_CATEGORY',
  /** 菜单 */
  NAV_MENU = 'NAV_MENU',
  /** 内容格式 */
  POST_FORMAT = 'POST_FORMAT',
  /** 内容标签 */
  POST_TAG = 'POST_TAG',
  /** 产品类别 */
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  /** 产品类型 */
  PRODUCT_TYPE = 'PRODUCT_TYPE'
}

/** 分类法 */
export type Term = Node & {
  __typename?: 'Term';
  /** 类别下内容数量统计 */
  count?: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  /** 描述 */
  description?: Maybe<Scalars['String']>;
  /** 特色图 */
  featured?: Maybe<Asset>;
  id: Scalars['ID'];
  /** 分类名 */
  name: Scalars['String'];
  /** 父类别 */
  pid?: Maybe<Scalars['ID']>;
  /** 类别标识 */
  slug: Scalars['String'];
  /** 分类模式 */
  taxonomy: TaxonomyEnum;
  updatedAt: Scalars['DateTime'];
};

export type TermList = PaginatedList & {
  __typename?: 'TermList';
  items: Array<Term>;
  totalItems: Scalars['Int'];
};

/** 更新管理员密码结果 */
export type UpdateAdministratorPasswordResult = InvalidCredentialsError | NativeAuthStrategyError | Success;

export type User = Node & {
  __typename?: 'User';
  authenticationMethods: Array<AuthenticationMethod>;
  createdAt: Scalars['DateTime'];
  displayName?: Maybe<Scalars['String']>;
  featured?: Maybe<Asset>;
  id: Scalars['ID'];
  identifier: Scalars['String'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  roles: Array<Role>;
  updatedAt: Scalars['DateTime'];
  verified: Scalars['Boolean'];
};

/**
 * Returned if the verification token (used to verify a Customer's email address) is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type VerificationTokenExpiredError = ErrorResult & {
  __typename?: 'VerificationTokenExpiredError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};

/**
 * Returned if the verification token (used to verify a Customer's email address) is either
 * invalid or does not match any expected tokens.
 */
export type VerificationTokenInvalidError = ErrorResult & {
  __typename?: 'VerificationTokenInvalidError';
  errorCode: ErrorCode;
  message: Scalars['String'];
};
