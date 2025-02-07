import { TweetSearchResult } from "src/types/index.js";
import Cookie3Client from "./client.js";

const API_KEY = process.env.COOKIE3_API_KEY || "";

/**
 * Search for tweets matching a query within a date range
 * @param {string} searchQuery - Word or phrase to search for in tweet text
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @returns {Promise<TweetSearchResult[]>} List of matching tweets with engagement metrics
 */
export async function searchTweets(
  searchQuery: string,
  fromDate: string,
  toDate: string,
): Promise<TweetSearchResult[]> {
  try {
    if (!searchQuery) {
      throw new Error("Search query is required");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }

    const client = new Cookie3Client(API_KEY);
    return await client.searchTweets(searchQuery, fromDate, toDate);
  } catch (error: any) {
    throw new Error(`Error searching tweets: ${error.message}`);
  }
}

/**
 * Search for recent tweets (last 7 days) matching a query
 * @param {string} searchQuery - Word or phrase to search for in tweet text
 * @returns {Promise<TweetSearchResult[]>} List of matching tweets with engagement metrics
 */
export async function searchRecentTweets(
  searchQuery: string,
): Promise<TweetSearchResult[]> {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const toDate = formatDate(today);
  const fromDate = formatDate(sevenDaysAgo);

  return searchTweets(searchQuery, fromDate, toDate);
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
