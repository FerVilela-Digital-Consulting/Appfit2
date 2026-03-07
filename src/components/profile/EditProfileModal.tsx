import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Scale, Ruler, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onOpenChange }) => {
    const { profile, updateProfile, updateAvatar, isGuest } = useAuth();
    const [fullName, setFullName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [goalType, setGoalType] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open && profile) {
            setFullName(profile.full_name || "");
            setBirthDate(profile.birth_date || "");
            setWeight(profile.weight?.toString() || "");
            setHeight(profile.height?.toString() || "");
            setGoalType(profile.goal_type || "");
            setAvatarPreview(profile.avatar_url || null);
            setAvatarFile(null);
            setRemoveAvatar(false);
        }
    }, [open, profile]);

    const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (isGuest) {
            toast.info("Modo invitado: la carga de avatar esta deshabilitada.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Selecciona un archivo de imagen.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setAvatarPreview(reader.result);
                setAvatarFile(file);
                setRemoveAvatar(false);
            }
        };
        reader.onerror = () => toast.error("No se pudo leer el archivo de imagen.");
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedHeight = height ? Number(height) : null;
        const parsedWeight = weight ? Number(weight) : null;

        if (parsedHeight !== null && (!Number.isFinite(parsedHeight) || parsedHeight <= 0)) {
            toast.error("La altura debe ser un numero positivo.");
            return;
        }

        if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
            toast.error("El peso debe ser un numero positivo.");
            return;
        }

        setIsSaving(true);
        try {
            let nextAvatarUrl: string | null | undefined = profile?.avatar_url ?? null;

            if (avatarFile && !isGuest) {
                nextAvatarUrl = await updateAvatar(avatarFile);
            }

            if (removeAvatar && !isGuest) {
                nextAvatarUrl = null;
            }

            await updateProfile({
                full_name: fullName,
                birth_date: birthDate || null,
                weight: parsedWeight,
                height: parsedHeight,
                goal_type: goalType,
                avatar_url: nextAvatarUrl,
            });

            if (isGuest) {
                toast.info("Modo invitado: los cambios no se guardaran.");
            } else {
                toast.success("Perfil actualizado correctamente");
            }
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error?.message || "No se pudo actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                    <DialogDescription>
                        {isGuest
                            ? "Realiza cambios en tu perfil temporal de invitado."
                            : "Actualiza los datos de tu perfil y objetivos fitness."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4">
                    {isGuest && (
                        <Alert>
                            <AlertDescription>Modo invitado: los cambios no se guardaran.</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={avatarPreview || undefined} alt="Avatar de perfil" />
                            <AvatarFallback>{(fullName || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="avatar">Foto de perfil</Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                disabled={isGuest}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isGuest || !avatarPreview}
                                    onClick={() => {
                                        setAvatarPreview(null);
                                        setAvatarFile(null);
                                        setRemoveAvatar(true);
                                    }}
                                >
                                    Quitar foto
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                            id="fullName"
                            placeholder="Nombre completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                        <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight" className="flex items-center gap-2">
                                <Scale className="h-4 w-4" /> Peso (kg)
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                placeholder="70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height" className="flex items-center gap-2">
                                <Ruler className="h-4 w-4" /> Altura (cm)
                            </Label>
                            <Input
                                id="height"
                                type="number"
                                placeholder="175"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goalType" className="flex items-center gap-2">
                            <Target className="h-4 w-4" /> Objetivo fitness
                        </Label>
                        <Select value={goalType} onValueChange={setGoalType}>
                            <SelectTrigger id="goalType">
                                <SelectValue placeholder="Selecciona tu objetivo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Build Muscles">Ganar musculo</SelectItem>
                                <SelectItem value="Lose Weight">Bajar de peso</SelectItem>
                                <SelectItem value="Keep Fit">Mantenerse en forma</SelectItem>
                                <SelectItem value="Improve Endurance">Mejorar resistencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
