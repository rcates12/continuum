//Client component needs useState for dialog modal
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteHabit } from "@/src/actions/habits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";

export function DeleteHabitButton({ habitId }: { habitId: string }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        await deleteHabit(habitId);
        router.push("/habits");
    }

    return (
        <>
        <Button className="flex flex-none w-fit px-3 py-2 rounded-lg font-medium" variant="destructive" onClick={() => setOpen(true)}>
            <TrashIcon className="size-4" /> Delete Habit
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-card border-pink/30">
                <DialogHeader>
                    <DialogTitle className="text-pink font-semibold">Delete Habit</DialogTitle>
                    <DialogDescription className="text-foreground">
                        Are you sure you want to delete this habit? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-lg font-medium">Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} className="rounded-lg font-medium">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
