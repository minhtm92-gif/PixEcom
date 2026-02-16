"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDomainDto = exports.DomainVerificationMethod = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DomainVerificationMethod;
(function (DomainVerificationMethod) {
    DomainVerificationMethod["TXT"] = "TXT";
    DomainVerificationMethod["A_RECORD"] = "A_RECORD";
})(DomainVerificationMethod || (exports.DomainVerificationMethod = DomainVerificationMethod = {}));
let CreateDomainDto = (() => {
    var _a;
    let _hostname_decorators;
    let _hostname_initializers = [];
    let _hostname_extraInitializers = [];
    let _verificationMethod_decorators;
    let _verificationMethod_initializers = [];
    let _verificationMethod_extraInitializers = [];
    return _a = class CreateDomainDto {
            constructor() {
                this.hostname = __runInitializers(this, _hostname_initializers, void 0);
                this.verificationMethod = (__runInitializers(this, _hostname_extraInitializers), __runInitializers(this, _verificationMethod_initializers, void 0));
                __runInitializers(this, _verificationMethod_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _hostname_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'mystore.com',
                    description: 'The domain hostname to verify',
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, {
                    message: 'Invalid domain format',
                })];
            _verificationMethod_decorators = [(0, swagger_1.ApiProperty)({
                    enum: DomainVerificationMethod,
                    example: DomainVerificationMethod.TXT,
                    description: 'DNS verification method (TXT record or A record)',
                }), (0, class_validator_1.IsEnum)(DomainVerificationMethod)];
            __esDecorate(null, null, _hostname_decorators, { kind: "field", name: "hostname", static: false, private: false, access: { has: obj => "hostname" in obj, get: obj => obj.hostname, set: (obj, value) => { obj.hostname = value; } }, metadata: _metadata }, _hostname_initializers, _hostname_extraInitializers);
            __esDecorate(null, null, _verificationMethod_decorators, { kind: "field", name: "verificationMethod", static: false, private: false, access: { has: obj => "verificationMethod" in obj, get: obj => obj.verificationMethod, set: (obj, value) => { obj.verificationMethod = value; } }, metadata: _metadata }, _verificationMethod_initializers, _verificationMethod_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateDomainDto = CreateDomainDto;
