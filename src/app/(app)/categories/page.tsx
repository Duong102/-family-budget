import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryDeleteButton } from "@/app/(app)/categories/category-delete-button";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { householdId: user.householdId },
    orderBy: { name: "asc" },
  });

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <p className="text-sm text-muted-foreground">Quản lý danh mục thu và chi</p>
      </div>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Chi ({expenseCategories.length})</TabsTrigger>
          <TabsTrigger value="income">Thu ({incomeCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <CategoryFormDialog defaultType="EXPENSE" />
          </div>
          <CategoryList categories={expenseCategories} />
        </TabsContent>

        <TabsContent value="income" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <CategoryFormDialog defaultType="INCOME" />
          </div>
          <CategoryList categories={incomeCategories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryList({
  categories,
}: {
  categories: { id: string; name: string; type: string; color: string | null }[];
}) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>;
  }

  return (
    <div className="divide-y rounded-md border bg-background">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: category.color ?? "#a1a1aa" }}
            />
            <span className="text-sm font-medium">{category.name}</span>
          </div>
          <div className="flex gap-1">
            <CategoryFormDialog
              category={category}
              defaultType={category.type as "INCOME" | "EXPENSE"}
            />
            <CategoryDeleteButton id={category.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
