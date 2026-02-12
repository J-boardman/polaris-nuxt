"use node";

import Firecrawl from '@mendable/firecrawl-js';
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export const searchFirecrawl = internalAction({
  args: { searchQuery: v.string() },
  handler: async (ctx, { searchQuery }) => {
    const results = await firecrawl.search(searchQuery, {
      limit: 3,
      scrapeOptions: { formats: ['markdown'] }
    });
    return results;
  },
});
