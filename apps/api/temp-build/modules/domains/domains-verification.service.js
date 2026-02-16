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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsVerificationService = void 0;
const common_1 = require("@nestjs/common");
const dns_1 = require("dns");
const client_1 = require("@prisma/client");
let DomainsVerificationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DomainsVerificationService = _classThis = class {
        constructor(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(DomainsVerificationService.name);
        }
        /**
         * Verify a domain using the appropriate verification method
         */
        async verifyDomain(domain) {
            try {
                if (domain.verificationMethod === client_1.DomainVerificationMethod.TXT) {
                    return await this.verifyTxtRecord(domain.hostname, domain.verificationToken);
                }
                else {
                    return await this.verifyARecord(domain.hostname, domain.expectedARecordIp);
                }
            }
            catch (error) {
                this.logger.error(`Verification failed for ${domain.hostname}: ${error.message}`);
                return {
                    success: false,
                    error: error.message || 'Verification failed',
                };
            }
        }
        /**
         * Verify TXT record contains the expected verification token
         */
        async verifyTxtRecord(hostname, token) {
            try {
                // Resolve TXT records for the domain
                const records = await dns_1.promises.resolveTxt(hostname);
                // Flatten the records (each record can be an array of strings)
                const flatRecords = records.map((record) => record.join(''));
                // Look for the verification token in the format: pixecom-verify=TOKEN
                const expectedRecord = `pixecom-verify=${token}`;
                const found = flatRecords.some((record) => record === expectedRecord);
                if (found) {
                    return { success: true };
                }
                return {
                    success: false,
                    error: `TXT record not found. Expected: ${expectedRecord}`,
                };
            }
            catch (error) {
                if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
                    return {
                        success: false,
                        error: 'No TXT records found for this domain',
                    };
                }
                throw error;
            }
        }
        /**
         * Verify A record points to the expected IP address
         */
        async verifyARecord(hostname, expectedIp) {
            if (!expectedIp) {
                return {
                    success: false,
                    error: 'No expected IP address configured',
                };
            }
            try {
                // Resolve A records (IPv4) for the domain
                const addresses = await dns_1.promises.resolve4(hostname);
                // Check if any of the A records match the expected IP
                const found = addresses.includes(expectedIp);
                if (found) {
                    return { success: true };
                }
                return {
                    success: false,
                    error: `A record not found. Expected IP: ${expectedIp}, Found: ${addresses.join(', ')}`,
                };
            }
            catch (error) {
                if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
                    return {
                        success: false,
                        error: 'No A records found for this domain',
                    };
                }
                throw error;
            }
        }
        /**
         * Get the expected IP address for A record verification
         * This can be auto-detected or configured via environment variable
         */
        getExpectedIp() {
            const configuredIp = this.configService.get('EXPECTED_DOMAIN_IP');
            // If set to 'auto' or not set, we'd need to detect the server's IP
            // For now, return a placeholder or configured value
            if (!configuredIp || configuredIp === 'auto') {
                // In a real scenario, you'd detect the server's public IP
                // For development, return localhost
                return '127.0.0.1';
            }
            return configuredIp;
        }
    };
    __setFunctionName(_classThis, "DomainsVerificationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DomainsVerificationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DomainsVerificationService = _classThis;
})();
exports.DomainsVerificationService = DomainsVerificationService;
