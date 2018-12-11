%define name hastic-server
%define version 0.2.6_alpha
%define release 0
%define buildroot /root/rpmbuild/BUILDROOT
%define builddir /root/rpmbuild/BUILD

Name: %{name}
Version: %{version}
Release: %{release}
Summary: hastic-server

Group: Installation Script
License: Apache-2.0
URL: hastic.io
BuildRoot: %{buildroot}
Requires: nodejs >= 6
BuildRequires: nodejs
AutoReqProv: no
BuildArch: noarch

%description
REST server for managing data for analytics

%prep
echo PREP
pwd
mkdir -p %{buildroot}
cp -r ../server %{builddir}/
cp -r ../analytics %{builddir}/

%build
pushd analytics

save=$RPM_BUILD_ROOT
unset RPM_BUILD_ROOT

pip3 -q install -U pip setuptools pyinstaller
pip3 -q install -r requirements.txt
pyinstaller --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server

export RPM_BUILD_ROOT=$save
popd

pushd server
npm prune --production
npm rebuild
popd

%install
echo INSTALL
pwd
ls %{buildroot}
ls %{builddir}
mkdir -p %{buildroot}/%{_bindir}/hastic-server
cp -r ./ %{buildroot}/%{_bindir}/hastic-server

%post
echo POST
pwd
ls %{buildroot}
mkdir -p %{_bindir}/hastic-server
ln -s %{_bindir}/hastic-server/data /etc/hastic-server/data


#%clean
#rm -rf %{buildroot}

%files
%defattr(644, root, root, 755)
%{_bindir}/hastic-server/server/dist/*
%{_bindir}/hastic-server/analytics/dist/*
