import React, { useState } from "react";
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  InputAdornment,
} from "@mui/material";
import api from "../services/api";

const emptyData = () => ({
  feeStructure: "basic",

  companyName: "",
  date: "",
  registeredCompanyName: "",
  companyAddress: "",
  startDate: "",
  duration: "",

  basicFee: "",
  kpi: "",
  percentage: "",
  paymentSchedule: "",
  expiryDate: "",
});

function formatDateForDisplay(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toISOString().slice(0, 10).replace(/-/g, "/");
}

function ContractField({ id, label, ...props }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} variant="body2" sx={{ display: "block", mb: 0.75 }}>
        {label}
      </Typography>
      <TextField id={id} fullWidth {...props} />
    </Box>
  );
}

export default function Contract() {
  const [data, setData] = useState(emptyData());
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData((s) => ({ ...s, [field]: value }));
  };

  const handleFeeStructure = (value) => {
    if (value === "basic" && (data.kpi || data.percentage)) {
      const ok = window.confirm(
        "切换为「基础费用」后，KPI 和分成比例信息将被清除，是否继续？",
      );
      if (!ok) return;
    }

    setData((s) => ({
      ...s,
      feeStructure: value,
      ...(value === "basic" ? { kpi: "", percentage: "" } : {}),
    }));
  };

  const validate = () => {
    const e = {};
    if (!data.companyName) e.companyName = "请输入公司名称";
    if (!data.date) e.date = "请输入合同生成日期";
    if (!data.registeredCompanyName) e.registeredCompanyName = "请输入公司注册全名";
    if (!data.companyAddress) e.companyAddress = "请输入公司地址";
    if (!data.startDate) e.startDate = "请输入开始时间";
    if (!data.duration) e.duration = "请输入合同持续时间";
    if (!data.basicFee) e.basicFee = "请输入基础费用（每月）";
    if (!data.paymentSchedule) e.paymentSchedule = "请输入基础费用的付款机制";
    if (!data.expiryDate) e.expiryDate = "请输入报价有效期";
    if (data.feeStructure === "basic_kpi") {
      if (!data.kpi) e.kpi = "请输入KPI";
      if (!data.percentage) e.percentage = "请输入分成比例";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleExport = async () => {
    if (!validate()) {
      return;
    }
    try {
      const resp = await api.post(
        "/contracts/generate",
        { ...data },
        { responseType: "blob" },
      );

      const disposition = resp.headers["content-disposition"] || "";
      let filename = "contract.docx";
      const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const fallbackMatch = disposition.match(/filename="?([^"]+)"?/i);
      if (encodedMatch) {
        filename = decodeURIComponent(encodedMatch[1]);
      } else if (fallbackMatch) {
        filename = fallbackMatch[1];
      }

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      let msg = err.message || "导出失败";
      try {
        if (err.response && err.response.data) {
          const blob = err.response.data;
          if (typeof blob.text === "function") {
            const text = await blob.text();
            try {
              const j = JSON.parse(text);
              msg = j.message || text || msg;
            } catch (e) {
              msg = text || msg;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing error response", e);
      }
      alert("导出失败：" + msg);
    }
  };

  const handleClear = () => {
    const ok = window.confirm("确认清空所有表单？");
    if (!ok) return;
    setData(emptyData());
    setErrors({});
    setReviewMode(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Contract
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          ① 合作模式
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={data.feeStructure}
            onChange={(e) => handleFeeStructure(e.target.value)}
          >
            <FormControlLabel value="basic" control={<Radio />} label="基础费用" />
            <FormControlLabel value="basic_kpi" control={<Radio />} label="基础费用 + KPI 奖励" />
          </RadioGroup>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          ② 基本信息
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <ContractField
              id="companyName"
              label="公司名称"
              value={data.companyName}
              onChange={handleChange("companyName")}
              error={!!errors.companyName}
              helperText={errors.companyName}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ContractField
              id="date"
              label="合同生成日期"
              type="date"
              value={data.date}
              onChange={handleChange("date")}
              error={!!errors.date}
              helperText={errors.date}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <ContractField
              id="registeredCompanyName"
              label="公司注册全名"
              value={data.registeredCompanyName}
              onChange={handleChange("registeredCompanyName")}
              error={!!errors.registeredCompanyName}
              helperText={errors.registeredCompanyName}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <ContractField
              id="companyAddress"
              label="公司地址"
              value={data.companyAddress}
              onChange={handleChange("companyAddress")}
              error={!!errors.companyAddress}
              helperText={errors.companyAddress}
              size="small"
              multiline
              minRows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ContractField
              id="startDate"
              label="开始时间"
              type="date"
              value={data.startDate}
              onChange={handleChange("startDate")}
              error={!!errors.startDate}
              helperText={errors.startDate}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ContractField
              id="duration"
              label="合同持续时间（个月）"
              type="number"
              value={data.duration}
              onChange={handleChange("duration")}
              error={!!errors.duration}
              helperText={errors.duration}
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          ③ 服务费用 & 付款条款
        </Typography>

        <Grid container spacing={2}>
          

          <Grid item xs={12} sm={6}>
            <ContractField
              id="basicFee"
              label="基础费用（每月）"
              type="number"
              value={data.basicFee}
              onChange={handleChange("basicFee")}
              error={!!errors.basicFee}
              helperText={errors.basicFee}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">SGD</InputAdornment> }}
            />
          </Grid>

          {data.feeStructure === "basic_kpi" && (
            <>
              <Grid item xs={12} sm={6} />
              <Grid item xs={12} sm={6}>
                <ContractField
                  id="kpi"
                  label="KPI"
                  type="number"
                  value={data.kpi}
                  onChange={handleChange("kpi")}
                  error={!!errors.kpi}
                  helperText={errors.kpi}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start">SGD</InputAdornment> }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ContractField
                  id="percentage"
                  label="分成比例"
                  type="number"
                  value={data.percentage}
                  onChange={handleChange("percentage")}
                  error={!!errors.percentage}
                  helperText={errors.percentage}
                  size="small"
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <ContractField
              id="paymentSchedule"
              label="基础费用的付款机制"
              value={data.paymentSchedule}
              onChange={handleChange("paymentSchedule")}
              error={!!errors.paymentSchedule}
              helperText={errors.paymentSchedule}
              size="small"
              multiline
              minRows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ContractField
              id="expiryDate"
              label="报价有效期"
              type="date"
              value={data.expiryDate}
              onChange={handleChange("expiryDate")}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <Button variant="outlined" color="error" onClick={handleClear}>
          清空
        </Button>
        <Button variant="contained" color="primary" onClick={handleExport}>
          导出合同
        </Button>
      </Box>

      {/* Confirmation preview removed per request */}
    </Container>
  );
}
