import React, { useState } from 'react';

import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { CATEGORIES, Category, CATEGORY_ICONS, Expense } from '@/types/expense';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useExpenses } from '../context/ExpenseContext';

function formatDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(0);
  parsed.setFullYear(year, month - 1, day);
  parsed.setHours(12, 0, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

// Modal que sube desde abajo para registrar un gasto.
// Para poder agregarlo hacen falta el monto y la categoria; la descripcion es opcional.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expense,
}) => {
  const { addExpense, updateExpense } = useExpenses();
  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState(() => expense ? String(expense.amount) : '');
  const [category, setCategory] = useState<Category | null>(() => expense?.category ?? null);
  const [description, setDescription] = useState(() =>
    expense?.description?.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 400) ?? ''
  );
  const [date, setDate] = useState(() =>
    formatDateInput(expense?.date ?? new Date())
  );
  const [facturaAdjuntar, setFacturaAdjuntar] = useState<string | undefined>(
    () => expense?.factura_adjuntar
  );

  function resetForm() {
    setAmount('');
    setCategory(null);
    setDescription('');
    setDate(formatDateInput(new Date()));
    setFacturaAdjuntar(undefined);
  }

  const chooseInvoice = async (source: 'camera' | 'library') => {
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          source === 'camera'
            ? 'Permite el acceso a la cámara para tomar una foto del comprobante.'
            : 'Permite el acceso a tus fotos para adjuntar un comprobante.',
        );
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });

      if (!result.canceled && result.assets[0]) {
        setFacturaAdjuntar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar el comprobante', error);
      Alert.alert('Error', 'No se pudo seleccionar el comprobante. Intenta de nuevo.');
    }
  };

  const handleChooseInvoice = () => {
    Alert.alert('Adjuntar comprobante', 'Elige cómo quieres agregarlo', [
      { text: 'Tomar foto', onPress: () => void chooseInvoice('camera') },
      { text: 'Elegir de la galería', onPress: () => void chooseInvoice('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // async porque ahora hay que esperar a que el gasto se guarde en el telefono
  const handleSubmit = async () => {
    if (!amount) return;
    if (!category) {
      Alert.alert('Categoría requerida', 'Selecciona una categoría antes de guardar el gasto.');
      return;
    }

    const expenseDate = parseDateInput(date);
    if (!expenseDate) {
      Alert.alert('Fecha inválida', 'Ingresa una fecha válida en formato AAAA-MM-DD.');
      return;
    }
 
    try {
      const expenseData = {
        amount: parseFloat(amount),
        category,
        date: expenseDate,
        description: description.trim().slice(0, 400) || undefined,
        factura_adjuntar: facturaAdjuntar,
      };

      if (expense) {
        await updateExpense({ ...expenseData, id: expense.id });
      } else {
        await addExpense(expenseData);
      }
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
      return;
    }
 
    // Reset form
    resetForm();
    onClose();
  };


  // Igual que al guardar, se limpia el formulario para que no quede texto viejo
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>{expense ? 'Editar Gasto' : 'Agregar Gasto'}</Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Fecha del gasto</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={(value) =>
                      setDescription(value.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 400))
                    }
                    placeholder="Ej: Almuerzo, transporte a la universidad..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    maxLength={400}
                    multiline
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura / comprobante (opcional)</Text>
                  <TouchableOpacity
                    style={styles.invoiceButton}
                    onPress={handleChooseInvoice}
                  >
                    <Text style={styles.invoiceButtonText}>
                      {facturaAdjuntar ? 'Cambiar comprobante' : 'Tomar foto o elegir de la galería'}
                    </Text>
                  </TouchableOpacity>
                  {facturaAdjuntar && (
                    <View style={styles.invoicePreview}>
                      <Image source={{ uri: facturaAdjuntar }} style={styles.invoiceImage} />
                      <TouchableOpacity onPress={() => setFacturaAdjuntar(undefined)}>
                        <Text style={styles.removeInvoiceText}>Quitar comprobante</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !amount && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!amount}
                  >
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {expense ? 'Guardar cambios' : 'Agregar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  invoiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.three,
    alignItems: 'center',
  },
  invoiceButtonText: {
    color: LiquidGlassColors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  invoicePreview: {
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  invoiceImage: {
    width: 120,
    height: 120,
    borderRadius: Spacing.two,
  },
  removeInvoiceText: {
    color: LiquidGlassColors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
});
