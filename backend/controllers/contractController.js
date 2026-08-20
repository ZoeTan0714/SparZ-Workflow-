const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9\-_.]/gi, "_");
}

function requiredFieldsPresent(body) {
  const req = [
    "companyName",
    "date",
    "registeredCompanyName",
    "companyAddress",
    "startDate",
    "duration",
    "basicFee",
    "paymentSchedule",
    "expiryDate",
  ];
  for (const k of req) {
    if (!body[k]) return { ok: false, missing: k };
  }
  if (body.feeStructure === "basic_kpi") {
    if (!body.kpi) return { ok: false, missing: "kpi" };
    if (!body.percentage) return { ok: false, missing: "percentage" };
  }
  return { ok: true };
}

exports.generateContract = (req, res) => {
  const body = req.body || {};
  const check = requiredFieldsPresent(body);
  if (!check.ok) {
    return res.status(400).json({ message: `Missing field: ${check.missing}` });
  }

  const feeStructure = body.feeStructure === "basic_kpi" ? "basic_kpi" : "basic";

  const templatesDir = path.resolve(__dirname, "..", "templates");
  const templateFile = feeStructure === "basic" ? "contract-basic-fee.docx" : "contract-basic-fee-kpi.docx";
  const templatePath = [templateFile, `${templateFile}.docx`]
    .map((file) => path.join(templatesDir, file))
    .find((file) => fs.existsSync(file));

  if (!templatePath) {
    return res.status(500).json({
      message: `Template not found: ${templateFile}. Please add it to backend/templates/`,
    });
  }

  try {
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const data = {
      "Company Name": body.companyName,
      Date: body.date,
      "Registered Company Name": body.registeredCompanyName,
      "Company address": body.companyAddress,
      "Start Date": body.startDate,
      Duration: body.duration,
      "Fee Structure": feeStructure === "basic" ? "基础费用" : "基础费用 + KPI 奖励",
      "Basic Fee": body.basicFee,
      KPI: body.kpi || "",
      Percentage: body.percentage || "",
      "Payment Schedule": body.paymentSchedule,
      "Expiry Date": body.expiryDate,
    };

    doc.setData(data);
    try {
      doc.render();
    } catch (error) {
      console.error("Doc render error", error);
      return res.status(500).json({ message: `Template render error: ${error?.message || "unknown"}` });
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    const cleanName = sanitizeFileName(body.companyName || "company");
    const datePart = (body.date || "").replace(/-/g, "_") || new Date().toISOString().slice(0, 10);
    const suffix = feeStructure === "basic" ? "基础费用" : "基础费用_KPI";
    const filename = `Contract_${cleanName}_${suffix}_${datePart}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    const encodedFilename = encodeURIComponent(filename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="contract.docx"; filename*=UTF-8''${encodedFilename}`,
    );
    return res.send(buf);
  } catch (err) {
    console.error("Contract generation error:", err);
    const msg = err?.message || "Server error generating contract";
    return res.status(500).json({ message: msg });
  }
};
