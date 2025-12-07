/**
 * Visit Store State - internal state of the visit store
 */

import type { User } from "@homevisit/common";
import type { VisitCard } from "./VisitCard";
import type { SiteFilters } from "./SiteFilters";

export interface VisitStoreState {
  cards: VisitCard[];
  loading: boolean;
  error: string | null;
  filters: SiteFilters;
  groupUsers: User[];
}
