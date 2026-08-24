import { Button } from "@/components/ui/button";

type Wallet = { id: string; name: string };
type Category = { id: string; name: string };

export function FilterBar({
  wallets,
  categories,
  defaultValues,
}: {
  wallets: Wallet[];
  categories: Category[];
  defaultValues: {
    walletId?: string;
    categoryId?: string;
    type?: string;
    from?: string;
    to?: string;
  };
}) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-md border bg-background p-4" method="get">
      <FilterSelect
        name="type"
        label="Loại"
        defaultValue={defaultValues.type}
        options={[
          { value: "", label: "Tất cả" },
          { value: "EXPENSE", label: "Chi" },
          { value: "INCOME", label: "Thu" },
          { value: "TRANSFER", label: "Chuyển khoản" },
        ]}
      />
      <FilterSelect
        name="walletId"
        label="Ví"
        defaultValue={defaultValues.walletId}
        options={[{ value: "", label: "Tất cả" }, ...wallets.map((w) => ({ value: w.id, label: w.name }))]}
      />
      <FilterSelect
        name="categoryId"
        label="Danh mục"
        defaultValue={defaultValues.categoryId}
        options={[
          { value: "", label: "Tất cả" },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="from">
          Từ ngày
        </label>
        <input
          id="from"
          name="from"
          type="date"
          defaultValue={defaultValues.from}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="to">
          Đến ngày
        </label>
        <input
          id="to"
          name="to"
          type="date"
          defaultValue={defaultValues.to}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        />
      </div>
      <Button type="submit" variant="secondary">
        Lọc
      </Button>
      <Button asChild variant="ghost">
        <a href="/transactions">Xóa lọc</a>
      </Button>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-9 min-w-32 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
