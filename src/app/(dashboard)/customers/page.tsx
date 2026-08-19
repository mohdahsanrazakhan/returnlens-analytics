"use client";

import * as React from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { RiskDistributionChart } from "@/components/customers/RiskDistributionChart";
import { RiskSummaryCards } from "@/components/customers/RiskSummaryCards";
import { CustomerRiskTable } from "@/components/customers/CustomerRiskTable";
import { CustomerProfileCard } from "@/components/customers/CustomerProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import type { CustomerLite } from "@/types";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function CustomersPage() {
  const [page, setPage] = React.useState(1);
  const [risk, setRisk] = React.useState("high");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<CustomerLite | null>(null);
  const { t } = useLanguage();

  const { data, loading, error } = useCustomers({ page, limit: 20, risk, sort: "riskScore", order: "desc", search });

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card>
          <CardContent className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RiskDistributionChart distribution={data.distribution} />
          </div>
          <RiskSummaryCards distribution={data.distribution} />
        </div>
      )}

      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("page.customers")}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder={t("common.searchNameEmail")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-48"
              maxLength={100}
            />
            <Select
              value={risk}
              onChange={(e) => {
                setRisk(e.target.value);
                setPage(1);
              }}
              className="w-auto"
            >
              <option value="all">{t("common.allRisk")}</option>
              <option value="low">{t("risk.low")}</option>
              <option value="medium">{t("risk.medium")}</option>
              <option value="high">{t("risk.high")}</option>
              <option value="critical">{t("risk.critical")}</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading || !data ? (
            <LoadingSpinner label={t("loading.customers")} />
          ) : (
            <>
              <CustomerRiskTable customers={data.customers} onSelect={setSelected} />
              <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <CustomerProfileCard customerId={selected?._id ?? null} onClose={() => setSelected(null)} />
    </div>
  );
}
