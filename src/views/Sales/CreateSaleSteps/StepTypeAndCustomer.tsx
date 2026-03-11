import React from 'react';
import type { Customer, SaleType } from '../../../api';
import { Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '../../../components/ui';
import { SALE_TYPE_OPTIONS } from '../hooks/useCreateSaleFlow';

interface StepTypeAndCustomerProps {
  customerQuery: string;
  selectedCustomer: Customer | null;
  selectedSaleType: SaleType | null;
  customers: Customer[];
  isLoadingCustomers: boolean;
  onCustomerQueryChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onSaleTypeSelect: (type: SaleType) => void;
}

const StepTypeAndCustomer: React.FC<StepTypeAndCustomerProps> = ({
  customerQuery,
  selectedCustomer,
  selectedSaleType,
  customers,
  isLoadingCustomers,
  onCustomerQueryChange,
  onCustomerSelect,
  onSaleTypeSelect,
}) => {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Tipo de Venta
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {SALE_TYPE_OPTIONS.map((type) => (
            <Chip
              key={type}
              label={type}
              color={selectedSaleType === type ? 'primary' : 'default'}
              variant={selectedSaleType === type ? 'filled' : 'outlined'}
              onClick={() => onSaleTypeSelect(type)}
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Cliente
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, email, teléfono o ID..."
          value={customerQuery}
          onChange={(e) => onCustomerQueryChange(e.target.value)}
          sx={{ mb: 1.5 }}
        />

        {isLoadingCustomers ? (
          <Typography variant="body2" color="text.secondary">
            Cargando clientes...
          </Typography>
        ) : customers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se encontraron clientes activos
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {customers.map((customer) => {
              const isSelected =
                selectedCustomer?.customerId === customer.customerId;
              return (
                <Card
                  key={customer.customerId}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                  }}
                  onClick={() => onCustomerSelect(customer)}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                    >
                      <Box>
                        <Typography variant="subtitle2">{customer.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {customer.customerId}
                        </Typography>
                      </Box>
                      {isSelected && <Chip size="small" color="primary" label="Seleccionado" />}
                    </Stack>
                    {customer.email && (
                      <Typography variant="caption" display="block">
                        {customer.email}
                      </Typography>
                    )}
                    {customer.phone && (
                      <Typography variant="caption" display="block">
                        {customer.phone}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default StepTypeAndCustomer;
