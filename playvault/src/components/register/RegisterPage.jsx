import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Toaster, toast } from '../ui/sonner';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      toast.success('Đăng ký thành công!', {
        description: 'Bạn sẽ được chuyển đến trang đăng nhập.',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error('Đăng ký thất bại.', {
        description: 'Vui lòng kiểm tra lại thông tin và thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Toaster richColors position="top-right" />
      <Card className="w-full max-w-md bg-purple-900/20 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Đăng Ký</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-purple-200">Tên người dùng</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300"
                placeholder="Nhập tên người dùng"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-purple-200">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300"
                placeholder="Nhập email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-purple-200">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </Button>
          </form>
          <p className="mt-4 text-center text-purple-300">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-purple-200 hover:underline">
              Đăng nhập
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;