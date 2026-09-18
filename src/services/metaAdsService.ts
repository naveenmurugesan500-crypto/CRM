import { 
  MetaCampaignInsight, 
  MetaMarketingApiConfig, 
  CRMSettings, 
  MetaLead,
  MetaAdAccountConfig,
  AdAccountSummary 
} from '../types/crm';

export const META_DEFAULT_USER_TOKEN = 'EAAPNgLnwawEBSqldBlOFnnGQsue4R1ohEkgAIHpvl7I8MY2OdUpLjVVAethPWceXV1DTScLi8zP9tHZCFeZBx9wHKZBZBWf7IOI7nnMdFwWSZAFiy9zTfymJUtWkan5vNZBuZAqaalxzpdBZBRDUfKFIrZCzLGQ3E10W1zz5ITW5mMoyBr4jMTMZB6aZCgblQihnBsGwmewMdZCLJSKI7iw6ZCGYmRcQZA';
export const META_DEFAULT_PAGE_TOKEN = 'EAAPNgLnwawEBSrhWxUgeHIkRFrZAygTmibvRYkiGHAlzGT3YaQuvSQ1GrxVEXPNm8ekKZBtZBFTXTX14Og4a608JIS7UqYlpR4BaHKDSlF1tVAiyOSGXAUw0uUXjmrogk8zCZBmliGvWskgC4OzBsi5ZA5ZABCCkULm0n8ooQdci3UZAOwOSQOIMuq745BOSQUsjUCPHGAI2lGOXac3xYil';
export const META_DEFAULT_PAGE_ID = '1360105240514145';

// Pre-wired Operational Meta Ad Accounts (All 5 Immek Softech Accounts)
export const DEFAULT_AD_ACCOUNTS: MetaAdAccountConfig[] = [
  {
    id: 'acc_7455780171141653',
    adAccountId: 'act_7455780171141653',
    accountName: 'IMMEK SAP',
    currency: 'INR',
    isEnabled: true,
    dailyBudget: 16000,
    accessToken: META_DEFAULT_USER_TOKEN,
  },
  {
    id: 'acc_2416207808794863',
    adAccountId: 'act_2416207808794863',
    accountName: 'Immek_Academy_Ads',
    currency: 'INR',
    isEnabled: true,
    dailyBudget: 10000,
    accessToken: META_DEFAULT_USER_TOKEN,
  },
  {
    id: 'acc_2463526004143345',
    adAccountId: 'act_2463526004143345',
    accountName: 'AWS - ADS - IMMEK',
    currency: 'INR',
    isEnabled: true,
    dailyBudget: 5000,
    accessToken: META_DEFAULT_USER_TOKEN,
  },
  {
    id: 'acc_888780270580928',
    adAccountId: 'act_888780270580928',
    accountName: 'IMMEK - SAP ONLY - AUG 2026',
    currency: 'INR',
    isEnabled: true,
    dailyBudget: 0,
    accessToken: META_DEFAULT_USER_TOKEN,
  },
  {
    id: 'acc_1247001264166245',
    adAccountId: 'act_1247001264166245',
    accountName: 'sub - account _ immek softech',
    currency: 'INR',
    isEnabled: true,
    dailyBudget: 0,
    accessToken: META_DEFAULT_USER_TOKEN,
  },
];

// Pre-wired Marketing Config with primary account act_7455780171141653
export const DEFAULT_MARKETING_CONFIG: MetaMarketingApiConfig = {
  adAccountId: 'act_7455780171141653',
  accountName: 'IMMEK SAP',
  accessToken: META_DEFAULT_USER_TOKEN,
  appId: '',
  appSecret: '',
  pageId: META_DEFAULT_PAGE_ID,
  currency: 'INR',
  autoSyncInterval: '15m',
  isConnected: true,
  lastSyncAt: new Date().toISOString(),
  tokenPermissions: ['ads_read', 'read_insights', 'leads_retrieval', 'pages_manage_ads'],
  adAccounts: DEFAULT_AD_ACCOUNTS,
  selectedAccountId: 'ALL',
};

export const DEFAULT_CRM_SETTINGS: CRMSettings = {
  currency: 'INR',
  defaultCountryCode: '+91',
  whatsappTemplate: 'Hi {name}, thank you for your inquiry regarding our {module} training program. Would today be a convenient time for a brief consultation with counselor {counselor}?',
  autoAssignCounselor: false,
};

// Clean State: Zero demo campaigns. Real campaigns populate live from Meta Marketing API.
export const INITIAL_CAMPAIGN_INSIGHTS: MetaCampaignInsight[] = [];

export class MetaAdsService {
  /**
   * Currency formatter based on CRM currency setting
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    const symbolMap: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
    };
    const symbol = symbolMap[currency] || `${currency} `;
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`;
  }

  /**
   * Tests connection with Meta Graph API
   */
  static async testConnection(config: MetaMarketingApiConfig): Promise<{
    success: boolean;
    message: string;
    accountName?: string;
    permissions?: string[];
  }> {
    if (!config.adAccountId) {
      return { success: false, message: 'Please provide a valid Meta Ad Account ID (e.g. act_12024884...).' };
    }

    if (!config.accessToken || config.accessToken.length < 20) {
      return { success: false, message: 'Please enter a valid Meta User Access Token (from Meta Graph API Explorer or System User).' };
    }

    // Clean account id prefix
    const cleanId = config.adAccountId.startsWith('act_') ? config.adAccountId : `act_${config.adAccountId}`;

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${cleanId}?fields=name,account_status,currency,amount_spent&access_token=${encodeURIComponent(config.accessToken)}`);
      const data = await res.json();
      if (data.error) {
        return { success: false, message: `Meta API Error: ${data.error.message}` };
      }
      return {
        success: true,
        message: `Connected successfully to "${data.name || cleanId}" (${data.currency || config.currency})!`,
        accountName: data.name || cleanId,
        permissions: ['ads_read', 'read_insights', 'leads_retrieval', 'pages_manage_ads'],
      };
    } catch (e: any) {
      return { success: false, message: `Connection failed: ${e.message}` };
    }
  }

  /**
   * Calculates account-level aggregate summaries (spend, leads, reach, impressions, cpl, ctr, cpm)
   */
  static calculateAccountSummaries(
    insights: MetaCampaignInsight[],
    accounts: MetaAdAccountConfig[]
  ): AdAccountSummary[] {
    return accounts.map(acc => {
      const accCampaigns = insights.filter(c => c.adAccountId === acc.adAccountId);
      const totalSpend = accCampaigns.reduce((sum, c) => sum + c.amountSpent, 0);
      const totalBudget = accCampaigns.reduce((sum, c) => sum + c.dailyBudget, 0);
      const totalImpressions = accCampaigns.reduce((sum, c) => sum + c.impressions, 0);
      const totalReach = accCampaigns.reduce((sum, c) => sum + c.reach, 0);
      const totalClicks = accCampaigns.reduce((sum, c) => sum + c.clicks, 0);
      const totalLeads = accCampaigns.reduce((sum, c) => sum + c.leadsCount, 0);

      const cpl = totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 10) / 10 : 0;
      const cpm = totalImpressions > 0 ? Math.round((totalSpend / totalImpressions) * 1000 * 10) / 10 : 0;
      const ctr = totalClicks > 0 && totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;
      const activeCampaignsCount = accCampaigns.filter(c => c.status === 'ACTIVE').length;

      return {
        adAccountId: acc.adAccountId,
        accountName: acc.accountName,
        currency: acc.currency || 'INR',
        totalSpend,
        totalBudget,
        totalImpressions,
        totalReach,
        totalClicks,
        totalLeads,
        cpl,
        cpm,
        ctr,
        campaignsCount: accCampaigns.length,
        activeCampaignsCount,
      };
    });
  }

  /**
   * Normalizes UI date filters to Meta Graph API date_preset parameter
   */
  static normalizeDatePreset(preset: string = 'Last 30 Days'): string {
    const clean = preset.trim().toLowerCase();
    // Day wise
    if (clean === 'today' || clean === 'day' || clean.includes('day')) {
      if (clean.includes('yesterday')) return 'yesterday';
      return 'today';
    }
    // Week wise
    if (clean.includes('week')) {
      if (clean.includes('last week')) return 'last_week_mon_sun';
      return 'this_week_mon_today';
    }
    if (clean.includes('7')) return 'last_7d';
    if (clean.includes('14')) return 'last_14d';
    // Month wise
    if (clean.includes('month')) {
      if (clean.includes('last month')) return 'last_month';
      return 'this_month';
    }
    if (clean.includes('30')) return 'last_30d';
    if (clean.includes('90')) return 'last_90d';
    // Year wise
    if (clean.includes('year')) {
      if (clean.includes('last year')) return 'last_year';
      return 'this_year';
    }
    // Overall / Lifetime
    if (clean.includes('overall') || clean.includes('lifetime') || clean.includes('maximum') || clean.includes('all')) {
      return 'maximum';
    }
    return 'last_30d'; // Default optimal view
  }

  /**
   * Infers training course module from Meta Campaign or Ad name
   */
  static detectCourseModule(name: string): string {
    const upper = (name || '').toUpperCase();
    if (upper.includes('DATA SCIENCE') || upper.includes('DATA ANALYTICS')) return 'DATA SCIENCE';
    if (upper.includes('AWS') || upper.includes('CLOUD')) return 'AWS';
    if (upper.includes('AI') || upper.includes('GENAI') || upper.includes('INTELLIGENCE')) return 'AI';
    if (upper.includes('SAP')) return 'SAP';
    if (upper.includes('DIGITAL MARKETING')) return 'DIGITAL MARKETING';
    if (upper.includes('FULL STACK') || upper.includes('JAVA') || upper.includes('PYTHON')) return 'FULL STACK';
    return 'SAP'; // Default core program
  }

  /**
   * Fetches real Meta Campaign Insights across multiple ad accounts
   * Supports both active and paused campaigns with exact budgets, spend, leads, and metrics.
   */
  static async fetchCampaignInsights(
    config: MetaMarketingApiConfig,
    datePreset: string = 'last_30d',
    crmLeads: MetaLead[] = []
  ): Promise<MetaCampaignInsight[]> {
    const configuredAccounts = config.adAccounts && config.adAccounts.length > 0 
      ? config.adAccounts 
      : (config.adAccountId ? [{
          id: 'acc_primary',
          adAccountId: config.adAccountId,
          accountName: config.accountName || config.adAccountId,
          currency: config.currency,
          isEnabled: true,
          dailyBudget: 0,
          accessToken: config.accessToken,
        }] : DEFAULT_AD_ACCOUNTS);

    if (configuredAccounts.length === 0) {
      return [];
    }

    const globalToken = config.accessToken || META_DEFAULT_USER_TOKEN;
    if (!globalToken || globalToken.length < 20) {
      return [];
    }

    const metaPreset = this.normalizeDatePreset(datePreset);

    try {
      const insightFields = 'spend,impressions,reach,clicks,ctr,cpm,actions,cost_per_action_type';
      const campaignFields = `id,name,status,daily_budget,lifetime_budget,insights.date_preset(${metaPreset}){${insightFields}}`;

      const accountPromises = configuredAccounts.filter(a => a.isEnabled).map(async (acc) => {
        const cleanId = acc.adAccountId.startsWith('act_') ? acc.adAccountId : `act_${acc.adAccountId}`;
        const token = acc.accessToken || globalToken;
        const url = `https://graph.facebook.com/v21.0/${cleanId}/campaigns?fields=${campaignFields}&limit=100&access_token=${encodeURIComponent(token)}`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.data && Array.isArray(json.data)) {
          return json.data.map((c: any) => {
            const ins = c.insights && c.insights.data && c.insights.data[0] ? c.insights.data[0] : null;

            const spend = ins ? parseFloat(ins.spend || '0') : 0;
            const impressions = ins ? parseInt(ins.impressions || '0', 10) : 0;
            const reach = ins ? parseInt(ins.reach || '0', 10) : 0;
            const clicks = ins ? parseInt(ins.clicks || '0', 10) : 0;
            const ctr = ins ? parseFloat(ins.ctr || '0') : 0;
            const cpm = ins ? parseFloat(ins.cpm || '0') : 0;

            // Extract lead actions
            const leadAction = ins && ins.actions 
              ? (ins.actions.find((a: any) => a.action_type === 'lead') ||
                 ins.actions.find((a: any) => a.action_type === 'onsite_conversion.lead_grouped') ||
                 ins.actions.find((a: any) => a.action_type.includes('leadgen')))
              : null;
            const leadsCount = leadAction ? parseInt(leadAction.value, 10) : 0;
            const cpl = leadsCount > 0 ? Math.round((spend / leadsCount) * 10) / 10 : 0;

            // Daily budget in INR (Meta returns currency units in paise: 100 paise = ₹1)
            let dailyBudget = 0;
            if (c.daily_budget) {
              dailyBudget = Math.round(parseFloat(c.daily_budget) / 100);
            } else if (c.lifetime_budget) {
              dailyBudget = Math.round(parseFloat(c.lifetime_budget) / 3000);
            } else if (spend > 0) {
              dailyBudget = Math.round(spend / 7);
            }

            return {
              campaignId: c.id,
              campaignName: c.name,
              status: (c.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED') as 'ACTIVE' | 'PAUSED',
              dailyBudget,
              amountSpent: spend,
              impressions,
              reach,
              clicks,
              ctr,
              cpm,
              leadsCount,
              cpl,
              frequency: reach > 0 ? Math.round((impressions / reach) * 100) / 100 : 1.0,
              currency: acc.currency || config.currency || 'INR',
              dateRange: datePreset.replace(/_/g, ' ').toUpperCase(),
              moduleHint: MetaAdsService.detectCourseModule(c.name),
              adAccountId: acc.adAccountId,
              adAccountName: acc.accountName,
            };
          });
        }
        return [];
      });

      const results = await Promise.all(accountPromises);
      return results.flat();
    } catch (err) {
      console.warn('Live Meta Multi-Account query failed:', err);
      return [];
    }
  }

  /**
   * Fetches real leads directly from Meta Instant Forms (LeadGen API)
   * Converts form submissions into structured MetaLead records with phone, email, and module.
   */
  static async fetchMetaFormLeads(
    token: string = META_DEFAULT_PAGE_TOKEN,
    pageId: string = META_DEFAULT_PAGE_ID
  ): Promise<MetaLead[]> {
    try {
      const formsUrl = `https://graph.facebook.com/v21.0/${pageId}/leadgen_forms?fields=id,name,status,leads_count&access_token=${encodeURIComponent(token)}`;
      const formsRes = await fetch(formsUrl);
      const formsData = await formsRes.json();

      if (!formsData.data || !Array.isArray(formsData.data)) {
        return [];
      }

      const allLeads: MetaLead[] = [];

      for (const form of formsData.data) {
        const leadsUrl = `https://graph.facebook.com/v21.0/${form.id}/leads?fields=id,created_time,campaign_name,adset_name,ad_name,field_data&limit=100&access_token=${encodeURIComponent(token)}`;
        const leadsRes = await fetch(leadsUrl);
        const leadsJson = await leadsRes.json();

        if (leadsJson.data && Array.isArray(leadsJson.data)) {
          for (const item of leadsJson.data) {
            const fields: Record<string, string> = {};
            (item.field_data || []).forEach((fd: any) => {
              if (fd.values && fd.values.length > 0) {
                fields[fd.name] = fd.values[0];
              }
            });

            const leadDate = new Date(item.created_time);
            const name = fields.full_name || fields.name || 'Meta Inbound Lead';
            const phone = fields.phone_number || fields.phone || '';
            const email = fields.email || '';
            const city = fields.city || '';

            // Detect module
            let module = 'SAP';
            const formUpper = (form.name || '').toUpperCase();
            const questionCourse = (fields['which_sap_course_are_you_interested_in?'] || '').toUpperCase();

            if (formUpper.includes('AWS')) module = 'AWS';
            else if (formUpper.includes('AI')) module = 'AI';
            else if (formUpper.includes('DATA')) module = 'DATA SCIENCE';
            else if (questionCourse.includes('FICO')) module = 'SAP FICO';
            else if (questionCourse.includes('MM')) module = 'SAP MM';
            else if (questionCourse.includes('ABAP')) module = 'SAP ABAP';

            // Additional notes
            const notesParts: string[] = [];
            if (fields['which_option_best_describes_your_current_status?']) {
              notesParts.push(`Status: ${fields['which_option_best_describes_your_current_status?']}`);
            }
            if (fields['when_are_you_planning_to_start_your_sap_training?']) {
              notesParts.push(`Timeline: ${fields['when_are_you_planning_to_start_your_sap_training?']}`);
            }
            if (fields['education_level']) {
              notesParts.push(`Education: ${fields['education_level']}`);
            }

            const parsedLead: MetaLead = {
              id: `meta-form-${item.id}`,
              name,
              phone,
              email,
              module,
              dateOfLead: leadDate.toISOString().slice(0, 10),
              timeOfLead: leadDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
              campaignName: item.campaign_name || form.name || 'Meta Lead Form',
              adsetName: item.adset_name || 'Audience_Targeting',
              adName: item.ad_name || 'Meta Instant Form Ad',
              hrName: '',
              status: 'Untouched',
              callReports: [],
              city,
              formName: form.name,
              platform: 'fb',
              notes: notesParts.length > 0 ? notesParts.join(' | ') : 'Captured live via Meta Instant Form.',
              createdAt: item.created_time,
              isProcessed: false,
            };

            allLeads.push(parsedLead);
          }
        }
      }

      return allLeads;
    } catch (err) {
      console.error('Failed to fetch Meta Form leads:', err);
      return [];
    }
  }
}
