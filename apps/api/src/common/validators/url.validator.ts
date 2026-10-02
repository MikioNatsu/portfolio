/**
 * URL validation shared by every DTO that accepts a link.
 *
 * Two flavours:
 *  - `ASSET_URL` accepts absolute http(s) URLs **or** root-relative paths,
 *    so images served from `/uploads/...` are valid.
 *  - `EXTERNAL_URL` requires an absolute http(s) URL.
 */
export const ASSET_URL_REGEX = /^(https?:\/\/[^\s"'<>]{3,}|\/[^\s"'<>]*)$/i;
export const EXTERNAL_URL_REGEX = /^https?:\/\/[^\s"'<>]{3,}$/i;

export const ASSET_URL_MESSAGE =
  'Must be an absolute URL (https://…) or a root-relative path (/uploads/…).';
export const EXTERNAL_URL_MESSAGE = 'Must be an absolute URL starting with http:// or https://.';
