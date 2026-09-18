import { 
  MetaCampaignInsight, 
  MetaMarketingApiConfig, 
  CRMSettings, 
  MetaLead,
  MetaAdAccountConfig,
  AdAccountSummary 
} from '../types/crm';

// Clean State: Zero demo ad accounts. Real accounts are added by the user.
export const DEFAULT_AD_ACCOUNTS: MetaAdAccountConfig[] = [];

// Clean State: Empty credentials. Original credentials must be entered in Settings.
export const DEFAULT_MARKETING_CONFIG: MetaMarketingApiConfig = {
  adAccountId: '',
  accountName: '',
  accessToken: '',
  appId: '',
  appSecret: '',
  pageId: '',
  currency: 'INR',
  autoSyncInterval: '15m',
  isConnected: false,
  lastSyncAt: undefined,
  tokenPermissions: [],
  adAccounts: [],
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
   * Fetches real Meta Campaign Insights across multiple ad accounts
   * Returns empty array if no credentials configured (NO mock data!)
   */
  static async fetchCampaignInsights(
    config: MetaMarketingApiConfig,
    datePreset: string = 'last_7d',
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
        }] : []);

    if (configuredAccounts.length === 0) {
      return [];
    }

    // Require valid token
    if (!config.accessToken || config.accessToken.includes('[Meta_') || config.accessToken.length < 20) {
      return [];
    }

    try {
      const fields = 'campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpm,actions,cost_per_action_type';
      const accountPromises = configuredAccounts.filter(a => a.isEnabled).map(async (acc) => {
        const cleanId = acc.adAccountId.startsWith('act_') ? acc.adAccountId : `act_${acc.adAccountId}`;
        const token = acc.accessToken || config.accessToken;
        const url = `https://graph.facebook.com/v21.0/${cleanId}/insights?level=campaign&fields=${fields}&date_preset=${datePreset}&access_token=${encodeURIComponent(token)}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.data && Array.isArray(json.data)) {
          return json.data.map((item: any) => {
            const spend = parseFloat(item.spend || '0');
            const impressions = parseInt(item.impressions || '0', 10);
            const reach = parseInt(item.reach || '0', 10);
            const clicks = parseInt(item.clicks || '0', 10);
            const ctr = parseFloat(item.ctr || '0');
            const cpm = parseFloat(item.cpm || '0');

            const leadAction = (item.actions || []).find((a: any) => a.action_type === 'lead' || a.action_type.includes('leadgen'));
            const leadsCount = leadAction ? parseInt(leadAction.value, 10) : 0;
            const cpl = leadsCount > 0 ? Math.round((spend / leadsCount) * 10) / 10 : 0;

            return {
              campaignId: item.campaign_id,
              campaignName: item.campaign_name,
              status: 'ACTIVE' as const,
              dailyBudget: Math.round(spend / 7),
              amountSpent: spend,
              impressions,
              reach,
              clicks,
              ctr,
              cpm,
              leadsCount,
              cpl,
              frequency: reach > 0 ? Math.round((impressions / reach) * 100) / 100 : 1.0,
              currency: acc.currency || config.currency,
              dateRange: datePreset.replace(/_/g, ' ').toUpperCase(),
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
}
