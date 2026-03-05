import * as eslint from 'eslint';

/**
 * ESLint plugin for Nuxt 4 guardrails
 */
declare const _default: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'no-legacy-head': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                fixable: "code";
                schema: never[];
                messages: {
                    legacyHeadMethod: string;
                    legacyHeadOption: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-legacy-fetch-hook': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    legacyFetch: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-raw-fetch': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        testMode: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    rawFetch: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'prefer-import-meta-client': {
            meta: {
                type: "suggestion";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                fixable: "code";
                schema: {
                    type: string;
                    properties: {
                        allowProcessClientServer: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    preferImportMetaClient: string;
                    preferImportMetaServer: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'prefer-import-meta-dev': {
            meta: {
                type: "suggestion";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        testMode: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    useImportMetaDev: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-ssr-dom-access': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    unguardedDomAccess: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'valid-useAsyncData': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        requireStableAsyncDataKeys: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    missingCallback: string;
                    missingKey: string;
                    keyNotLiteral: string;
                    callbackReturnsNothing: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'valid-useFetch': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    missingUrl: string;
                    invalidOptions: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'app-structure-consistency': {
            meta: {
                type: "suggestion";
                docs: {
                    description: string;
                    recommended: boolean;
                };
                schema: {
                    type: "object";
                    properties: {
                        projectStyle: {
                            type: "string";
                            enum: string[];
                            default: string;
                        };
                    };
                    additionalProperties: false;
                }[];
                messages: {
                    conflictingStructure: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'require-use-seo-on-pages': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    missingUseSeo: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'prefer-use-seo-over-bare-meta': {
            meta: {
                type: "suggestion";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    preferUseSeo: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'require-schema-on-pages': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    missingSchema: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-map-async-in-server': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    mapAsync: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-raw-fetch-in-stores': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    rawFetchInStore: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'plugin-suffix-for-browser-apis': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    useClientSuffix: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-non-serializable-store-state': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: never[];
                messages: {
                    nonSerializable: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'require-csrf-header-on-mutations': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        testMode: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    missingCsrf: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-csrf-exempt-route-misuse': {
            meta: {
                type: "suggestion";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        testMode: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    missingSecretValidation: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
        'no-fetch-create-bypass': {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    category: string;
                    recommended: boolean;
                };
                schema: {
                    type: string;
                    properties: {
                        testMode: {
                            type: string;
                            default: boolean;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                messages: {
                    fetchCreateBypass: string;
                };
            };
            create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener;
        };
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                'nuxt-guardrails/no-legacy-head': string;
                'nuxt-guardrails/no-legacy-fetch-hook': string;
                'nuxt-guardrails/no-raw-fetch': string;
                'nuxt-guardrails/prefer-import-meta-client': string;
                'nuxt-guardrails/prefer-import-meta-dev': string;
                'nuxt-guardrails/no-ssr-dom-access': string;
                'nuxt-guardrails/valid-useAsyncData': string;
                'nuxt-guardrails/valid-useFetch': string;
                'nuxt-guardrails/app-structure-consistency': string;
                'nuxt-guardrails/require-use-seo-on-pages': string;
                'nuxt-guardrails/prefer-use-seo-over-bare-meta': string;
                'nuxt-guardrails/require-schema-on-pages': string;
                'nuxt-guardrails/no-map-async-in-server': string;
                'nuxt-guardrails/no-raw-fetch-in-stores': string;
                'nuxt-guardrails/plugin-suffix-for-browser-apis': string;
                'nuxt-guardrails/no-non-serializable-store-state': string;
                'nuxt-guardrails/require-csrf-header-on-mutations': string;
                'nuxt-guardrails/no-csrf-exempt-route-misuse': string;
                'nuxt-guardrails/no-fetch-create-bypass': string;
            };
        };
    };
};

export { _default as default };
