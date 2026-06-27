import medicineService from '../services/medicine.service.js';

export const getMedicines = async (req, res, next) => {
  try {
    const { search, filter, limit, skip } = req.query;
    const result = await medicineService.getMedicines({ search, filter, limit, skip });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Medicines list retrieved'
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    res.status(200).json({
      success: true,
      data: medicine,
      message: 'Medicine details retrieved'
    });
  } catch (error) {
    next(error);
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: medicine,
      message: 'Medicine added to inventory'
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: medicine,
      message: 'Medicine updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    await medicineService.deleteMedicine(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Medicine removed from inventory'
    });
  } catch (error) {
    next(error);
  }
};
