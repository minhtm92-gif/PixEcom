"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let DomainsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DomainsService = _classThis = class {
        constructor(prisma, verificationService) {
            this.prisma = prisma;
            this.verificationService = verificationService;
        }
        /**
         * Create a new domain for a store
         */
        async create(storeId, workspaceId, dto) {
            // Verify store exists and belongs to workspace
            const store = await this.prisma.store.findFirst({
                where: { id: storeId, workspaceId },
            });
            if (!store) {
                throw new common_1.NotFoundException('Store not found');
            }
            // Check if domain already exists
            const existing = await this.prisma.storeDomain.findFirst({
                where: { storeId, hostname: dto.hostname },
            });
            if (existing) {
                throw new common_1.BadRequestException('Domain already exists for this store');
            }
            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            // Get expected IP for A record method
            const expectedARecordIp = dto.verificationMethod === client_1.DomainVerificationMethod.A_RECORD
                ? this.verificationService.getExpectedIp()
                : null;
            // Create domain record
            const domain = await this.prisma.storeDomain.create({
                data: {
                    storeId,
                    hostname: dto.hostname,
                    verificationMethod: dto.verificationMethod,
                    verificationToken,
                    expectedARecordIp,
                    status: client_1.DomainStatus.PENDING,
                },
            });
            return Object.assign(Object.assign({}, domain), { verificationInstructions: this.getVerificationInstructions(domain) });
        }
        /**
         * List all domains for a store
         */
        async findAll(storeId, workspaceId) {
            // Verify store exists and belongs to workspace
            const store = await this.prisma.store.findFirst({
                where: { id: storeId, workspaceId },
            });
            if (!store) {
                throw new common_1.NotFoundException('Store not found');
            }
            return this.prisma.storeDomain.findMany({
                where: { storeId },
                orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
            });
        }
        /**
         * Get a single domain by ID
         */
        async findOne(domainId, storeId, workspaceId) {
            // Verify store belongs to workspace
            const store = await this.prisma.store.findFirst({
                where: { id: storeId, workspaceId },
            });
            if (!store) {
                throw new common_1.NotFoundException('Store not found');
            }
            const domain = await this.prisma.storeDomain.findFirst({
                where: { id: domainId, storeId },
            });
            if (!domain) {
                throw new common_1.NotFoundException('Domain not found');
            }
            return domain;
        }
        /**
         * Update a domain (set primary, toggle active)
         */
        async update(domainId, storeId, workspaceId, dto) {
            // Verify domain exists
            await this.findOne(domainId, storeId, workspaceId);
            // If setting as primary, unset other primaries first
            if (dto.isPrimary === true) {
                await this.prisma.storeDomain.updateMany({
                    where: { storeId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }
            // Update the domain
            return this.prisma.storeDomain.update({
                where: { id: domainId },
                data: dto,
            });
        }
        /**
         * Delete a domain
         */
        async remove(domainId, storeId, workspaceId) {
            // Verify domain exists
            const domain = await this.findOne(domainId, storeId, workspaceId);
            // Prevent deleting primary domain if there are other domains
            if (domain.isPrimary) {
                const otherDomains = await this.prisma.storeDomain.count({
                    where: { storeId, id: { not: domainId } },
                });
                if (otherDomains > 0) {
                    throw new common_1.BadRequestException('Cannot delete primary domain. Set another domain as primary first.');
                }
            }
            await this.prisma.storeDomain.delete({
                where: { id: domainId },
            });
        }
        /**
         * Manually trigger verification for a domain
         */
        async verify(domainId, storeId, workspaceId) {
            const domain = await this.findOne(domainId, storeId, workspaceId);
            // Run verification
            const result = await this.verificationService.verifyDomain(domain);
            // Update domain status
            const updatedDomain = await this.prisma.storeDomain.update({
                where: { id: domainId },
                data: {
                    status: result.success ? client_1.DomainStatus.VERIFIED : client_1.DomainStatus.FAILED,
                    verifiedAt: result.success ? new Date() : null,
                    lastCheckedAt: new Date(),
                    failureReason: result.error || null,
                },
            });
            return Object.assign(Object.assign({}, updatedDomain), { verificationResult: result });
        }
        /**
         * Find a verified domain by hostname (public method - no auth required)
         * Used for custom domain routing
         */
        async findByHostname(hostname) {
            const domain = await this.prisma.storeDomain.findFirst({
                where: {
                    hostname,
                    status: client_1.DomainStatus.VERIFIED,
                    isActive: true,
                },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            primaryDomain: true,
                        },
                    },
                },
            });
            if (!domain) {
                throw new common_1.NotFoundException('Domain not found or not verified');
            }
            return {
                domain: domain.hostname,
                isPrimary: domain.isPrimary,
                store: domain.store,
            };
        }
        /**
         * Get verification instructions for a domain
         */
        getVerificationInstructions(domain) {
            if (domain.verificationMethod === client_1.DomainVerificationMethod.TXT) {
                return {
                    method: 'TXT',
                    instructions: `Add a TXT record to your domain's DNS settings with the following value:`,
                    record: {
                        type: 'TXT',
                        name: '@',
                        value: `pixecom-verify=${domain.verificationToken}`,
                    },
                };
            }
            else {
                return {
                    method: 'A',
                    instructions: `Point your domain's A record to the following IP address:`,
                    record: {
                        type: 'A',
                        name: '@',
                        value: domain.expectedARecordIp,
                    },
                };
            }
        }
    };
    __setFunctionName(_classThis, "DomainsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DomainsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DomainsService = _classThis;
})();
exports.DomainsService = DomainsService;
