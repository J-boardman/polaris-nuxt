"use node";

import Firecrawl from '@mendable/firecrawl-js';
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export const searchFirecrawl = internalAction({
  args: { searchQuery: v.string(), limit: v.number() },
  handler: async (ctx, { searchQuery, limit }) => {
    const results = await firecrawl.search(searchQuery, {
      limit,
      scrapeOptions: { formats: ['markdown'] }
    });
    return results;
  },
});
