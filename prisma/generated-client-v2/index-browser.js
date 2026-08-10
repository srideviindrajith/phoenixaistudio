
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  service: 'service',
  budget: 'budget',
  message: 'message',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  subject: 'subject',
  message: 'message',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PackageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  category: 'category',
  price: 'price',
  features: 'features',
  launchUrl: 'launchUrl',
  demoUrl: 'demoUrl',
  documentationUrl: 'documentationUrl',
  buttonText: 'buttonText',
  buttonUrl: 'buttonUrl',
  billingCycle: 'billingCycle',
  currency: 'currency',
  popular: 'popular',
  featured: 'featured',
  visibility: 'visibility',
  status: 'status',
  tags: 'tags',
  shortDescription: 'shortDescription',
  longDescription: 'longDescription',
  buttonColor: 'buttonColor',
  gradient: 'gradient',
  buttonIcon: 'buttonIcon',
  buttonAction: 'buttonAction',
  order: 'order',
  offerEnabled: 'offerEnabled',
  offerLabel: 'offerLabel',
  customOfferLabel: 'customOfferLabel',
  originalPrice: 'originalPrice',
  offerPrice: 'offerPrice',
  offerStartDate: 'offerStartDate',
  offerEndDate: 'offerEndDate',
  discountPercentage: 'discountPercentage',
  offerMetadata: 'offerMetadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  image: 'image',
  client: 'client',
  technologies: 'technologies',
  link: 'link',
  featured: 'featured',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TestimonialScalarFieldEnum = {
  id: 'id',
  name: 'name',
  role: 'role',
  company: 'company',
  content: 'content',
  rating: 'rating',
  image: 'image',
  approved: 'approved',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SettingScalarFieldEnum = {
  id: 'id',
  siteName: 'siteName',
  logo_url: 'logo_url',
  instagram_id: 'instagram_id',
  key: 'key',
  value: 'value',
  type: 'type',
  adminEnabled: 'adminEnabled',
  publicEnabled: 'publicEnabled',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  message: 'message',
  type: 'type',
  read: 'read',
  link: 'link',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiAgentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  longDescription: 'longDescription',
  image: 'image',
  price: 'price',
  features: 'features',
  category: 'category',
  agentType: 'agentType',
  tags: 'tags',
  status: 'status',
  isPublic: 'isPublic',
  packageId: 'packageId',
  aiInstructions: 'aiInstructions',
  businessKnowledge: 'businessKnowledge',
  systemPrompt: 'systemPrompt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DemoModelScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  image: 'image',
  liveUrl: 'liveUrl',
  category: 'category',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CoreSystemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  category: 'category',
  image: 'image',
  slug: 'slug',
  launchUrl: 'launchUrl',
  devUrl: 'devUrl',
  prodUrl: 'prodUrl',
  version: 'version',
  environment: 'environment',
  icon: 'icon',
  banner: 'banner',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  email: 'email',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.CareerBuilderSettingsScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt'
};

exports.Prisma.ResumeTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  htmlContent: 'htmlContent',
  cssContent: 'cssContent',
  thumbnail: 'thumbnail',
  status: 'status',
  theme: 'theme',
  prompt: 'prompt',
  tags: 'tags',
  metadata: 'metadata',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PortfolioTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  htmlContent: 'htmlContent',
  cssContent: 'cssContent',
  thumbnail: 'thumbnail',
  status: 'status',
  theme: 'theme',
  prompt: 'prompt',
  tags: 'tags',
  metadata: 'metadata',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CoverLetterTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  htmlContent: 'htmlContent',
  cssContent: 'cssContent',
  thumbnail: 'thumbnail',
  status: 'status',
  theme: 'theme',
  prompt: 'prompt',
  tags: 'tags',
  metadata: 'metadata',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CoverLetterServiceScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt'
};

exports.Prisma.CareerOrderScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt'
};

exports.Prisma.CareerDownloadScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt'
};

exports.Prisma.SalonCustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalonAppointmentScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  serviceId: 'serviceId',
  date: 'date',
  time: 'time',
  stylist: 'stylist',
  specialNotes: 'specialNotes',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalonServiceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  duration: 'duration',
  category: 'category',
  image: 'image',
  status: 'status',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalonSettingsScalarFieldEnum = {
  id: 'id',
  businessName: 'businessName',
  logo: 'logo',
  whatsappNumber: 'whatsappNumber',
  email: 'email',
  address: 'address',
  openingHours: 'openingHours',
  location: 'location',
  parkingInfo: 'parkingInfo',
  paymentMethods: 'paymentMethods',
  cancellationPolicy: 'cancellationPolicy',
  offers: 'offers',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AtsReviewScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  candidate: 'candidate',
  assignedReviewer: 'assignedReviewer',
  status: 'status',
  priority: 'priority',
  reviewDate: 'reviewDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AtsScoreScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  metric: 'metric',
  value: 'value',
  trend: 'trend',
  explanation: 'explanation',
  calculation: 'calculation',
  problems: 'problems',
  suggestions: 'suggestions',
  progress: 'progress',
  aiRecommendation: 'aiRecommendation',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AtsKeywordScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  word: 'word',
  category: 'category',
  importance: 'importance',
  suggestion: 'suggestion',
  createdAt: 'createdAt'
};

exports.Prisma.AtsDiagnosticScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  severity: 'severity',
  title: 'title',
  description: 'description',
  suggestion: 'suggestion',
  expanded: 'expanded',
  createdAt: 'createdAt'
};

exports.Prisma.AtsTimelineScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  description: 'description',
  timestamp: 'timestamp',
  user: 'user',
  createdAt: 'createdAt'
};

exports.Prisma.AtsNoteScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  content: 'content',
  author: 'author',
  timestamp: 'timestamp',
  createdAt: 'createdAt'
};

exports.Prisma.AtsSuggestionScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  priority: 'priority',
  title: 'title',
  description: 'description',
  estimatedGain: 'estimatedGain',
  difficulty: 'difficulty',
  impact: 'impact',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AtsVersionScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  date: 'date',
  resume: 'resume',
  score: 'score',
  status: 'status',
  staff: 'staff',
  createdAt: 'createdAt'
};

exports.Prisma.AtsActivityLogScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  description: 'description',
  timestamp: 'timestamp',
  user: 'user',
  createdAt: 'createdAt'
};

exports.Prisma.AtsWorkflowStepScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  stepId: 'stepId',
  label: 'label',
  status: 'status',
  user: 'user',
  time: 'time',
  details: 'details',
  createdAt: 'createdAt'
};

exports.Prisma.AtsSectionInspectorScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  name: 'name',
  content: 'content',
  score: 'score',
  issues: 'issues',
  expanded: 'expanded',
  createdAt: 'createdAt'
};

exports.Prisma.AtsFormattingIssueScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  severity: 'severity',
  description: 'description',
  location: 'location',
  createdAt: 'createdAt'
};

exports.Prisma.AtsGrammarIssueScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  text: 'text',
  suggestion: 'suggestion',
  aiRecommendation: 'aiRecommendation',
  createdAt: 'createdAt'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  category: 'category',
  tagline: 'tagline',
  description: 'description',
  features: 'features',
  benefits: 'benefits',
  technologies: 'technologies',
  ctaButtonText: 'ctaButtonText',
  ctaLink: 'ctaLink',
  icon: 'icon',
  gradient: 'gradient',
  accentColor: 'accentColor',
  thumbnail: 'thumbnail',
  coverImage: 'coverImage',
  backgroundGradient: 'backgroundGradient',
  status: 'status',
  visibility: 'visibility',
  featured: 'featured',
  order: 'order',
  badge: 'badge',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  seoKeywords: 'seoKeywords',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Admin: 'Admin',
  Lead: 'Lead',
  Contact: 'Contact',
  Package: 'Package',
  Project: 'Project',
  Testimonial: 'Testimonial',
  Setting: 'Setting',
  Notification: 'Notification',
  AiAgent: 'AiAgent',
  DemoModel: 'DemoModel',
  CoreSystem: 'CoreSystem',
  PasswordResetToken: 'PasswordResetToken',
  CareerBuilderSettings: 'CareerBuilderSettings',
  ResumeTemplate: 'ResumeTemplate',
  PortfolioTemplate: 'PortfolioTemplate',
  CoverLetterTemplate: 'CoverLetterTemplate',
  CoverLetterService: 'CoverLetterService',
  CareerOrder: 'CareerOrder',
  CareerDownload: 'CareerDownload',
  SalonCustomer: 'SalonCustomer',
  SalonAppointment: 'SalonAppointment',
  SalonService: 'SalonService',
  SalonSettings: 'SalonSettings',
  AtsReview: 'AtsReview',
  AtsScore: 'AtsScore',
  AtsKeyword: 'AtsKeyword',
  AtsDiagnostic: 'AtsDiagnostic',
  AtsTimeline: 'AtsTimeline',
  AtsNote: 'AtsNote',
  AtsSuggestion: 'AtsSuggestion',
  AtsVersion: 'AtsVersion',
  AtsActivityLog: 'AtsActivityLog',
  AtsWorkflowStep: 'AtsWorkflowStep',
  AtsSectionInspector: 'AtsSectionInspector',
  AtsFormattingIssue: 'AtsFormattingIssue',
  AtsGrammarIssue: 'AtsGrammarIssue',
  Service: 'Service'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
