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
        <Button className="flex flex-none w-fit px-3 py-2" variant="destructive" size="icon" onClick={() => setOpen(true)}>
            <TrashIcon className="size-4" /> Delete Habit
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Habit</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this habit? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
